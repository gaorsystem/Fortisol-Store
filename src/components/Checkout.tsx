import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Truck, MapPin, User, Phone, CreditCard, ShieldCheck, Info, Loader2, MessageCircle } from 'lucide-react';
import { CartItem } from './Cart';
import { peruLocations } from '../data/locations';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  items: CartItem[];
  onBack: () => void;
  onSuccess: () => void;
}

export function Checkout({ items, onBack, onSuccess }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessPhone, setBusinessPhone] = useState("51976791234");
  const [yapeQr, setYapeQr] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dni: '',
    department: '',
    province: '',
    district: '',
    address: '',
    reference: '',
    payment_method_choice: 'pay_now', // 'pay_now' or 'pay_later'
    operation_number: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number, yape_qr_url')
        .eq('id', 1)
        .single();
      if (data?.whatsapp_number) setBusinessPhone(data.whatsapp_number);
      if (data?.yape_qr_url) setYapeQr(data.yape_qr_url);
    };
    fetchSettings();
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const departments = Object.keys(peruLocations).sort();
  const provinces = formData.department ? Object.keys(peruLocations[formData.department]).sort() : [];
  const districts = (formData.department && formData.province) ? peruLocations[formData.department][formData.province].sort() : [];

  const isLimaLima = formData.department === "Lima" && formData.province === "Lima";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset dependent fields
      if (name === 'department') {
        newData.province = '';
        newData.district = '';
      } else if (name === 'province') {
        newData.district = '';
      }
      
      return newData;
    });
  };

  const getNextOrderId = () => {
    const lastId = localStorage.getItem('fortisol_order_count') || '0';
    const nextId = parseInt(lastId) + 1;
    localStorage.setItem('fortisol_order_count', nextId.toString());
    return `PTF-${nextId.toString().padStart(4, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const orderId = getNextOrderId();
    
    // Save to Supabase
    try {
      // 1. Upsert customer first to maintain CRM directory
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          name: formData.name,
          phone: formData.phone,
          dni: formData.dni,
          department: formData.department,
          province: formData.province,
          district: formData.district,
          address: formData.address
        }, { onConflict: 'phone' });

      if (customerError) console.error('Error upserting customer:', customerError);

      // 2. Save the order
      const { error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          department: formData.department,
          province: formData.province,
          district: formData.district,
          total: total,
          status: formData.payment_method_choice === 'pay_now' ? 'paid' : 'pending',
          items: items,
          order_custom_id: orderId,
          customer_dni: formData.dni,
          shipping_method: isLimaLima ? 'delivery' : 'shalom',
          source: 'web_store',
          payment_method: formData.payment_method_choice === 'pay_now' ? 'Directo (App)' : 'WhatsApp',
          admin_notes: formData.operation_number ? `Cód. Operación: ${formData.operation_number}` : ''
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving order to Supabase:', error);
      // We still proceed with WhatsApp even if DB save fails, but log it
    }
    
    let shippingDetails = "";
    if (isLimaLima) {
      shippingDetails = `📍 *Dirección:* ${formData.address}${formData.reference ? `, Ref: ${formData.reference}` : ''}\n🏙️ *Ubicación:* ${formData.district}, ${formData.province}, ${formData.department}\n🚚 *Tipo:* Delivery a domicilio`;
    } else {
      shippingDetails = `🏙️ *Ubicación:* ${formData.district}, ${formData.province}, ${formData.department}\n🚚 *Tipo:* Courier Shalom (Recojo en Agencia)\n_Nota: Se enviará a la agencia Shalom más cercana a su localidad._`;
    }

    const productsList = items.map(item => `• ${item.name.toUpperCase()} [${item.variantName}] (x${item.quantity}): S/ ${(item.price * item.quantity).toFixed(2)}`).join('\n');

    const message = `📦 *NUEVO PEDIDO - FORTISOL PERÚ*\n` +
      `------------------------------------------\n` +
      `🆔 *Orden:* ${orderId}\n\n` +
      `👤 *DATOS DEL CLIENTE*\n` +
      `*Nombre:* ${formData.name}\n` +
      `${formData.dni ? `*DNI:* ${formData.dni}\n` : ''}` +
      `*Teléfono:* ${formData.phone}\n\n` +
      `🚚 *DETALLES DE ENVÍO*\n` +
      `${shippingDetails}\n\n` +
      `🛒 *PRODUCTOS*\n` +
      `${productsList}\n\n` +
      `------------------------------------------\n` +
      `💰 *TOTAL A PAGAR: S/ ${total.toFixed(2)}*\n` +
      `💳 *MÉTODO:* ${formData.payment_method_choice === 'pay_now' ? 'PAGO DIRECTO REALIZADO' : 'COORDINAR POR WHATSAPP'}\n` +
      `${formData.operation_number ? `🔢 *N° OPERACIÓN:* ${formData.operation_number}\n` : ''}` +
      `------------------------------------------\n\n` +
      `_Pedido generado desde la tienda web Fortisol Perú._\n` +
      `${formData.payment_method_choice === 'pay_now' ? '_Ya realicé el pago, adjunto el número de operación._' : '_Por favor, confírmenme el pedido para proceder con el pago._'}`;

    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al carrito
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              {/* Stepper */}
              <div className="flex items-center justify-between mb-10">
                <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-black' : 'text-gray-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Contacto</span>
                </div>
                <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
                <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-black' : 'text-gray-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Envío</span>
                </div>
                <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />
                <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-black' : 'text-gray-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Confirmar</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-black tracking-tight uppercase">Información de Contacto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Nombre Completo *</label>
                        <input 
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors"
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Teléfono / WhatsApp *</label>
                        <input 
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 9) {
                              setFormData({...formData, phone: val});
                            }
                          }}
                          className={`w-full border p-3 outline-none transition-colors ${formData.phone.length === 9 ? 'border-green-500 focus:border-green-600' : 'border-gray-200 focus:border-black'}`}
                          placeholder="987654321"
                        />
                        {formData.phone && formData.phone.length !== 9 && (
                          <p className="text-[9px] text-red-500 font-bold uppercase">Debe tener 9 dígitos</p>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.name || formData.phone.length !== 9}
                      className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                    >
                      Continuar al Envío
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-black tracking-tight uppercase">Detalles de Envío</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Departamento *</label>
                        <select 
                          required
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors bg-white"
                        >
                          <option value="">Seleccionar</option>
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Provincia *</label>
                        <select 
                          required
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          disabled={!formData.department}
                          className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors bg-white disabled:bg-gray-50"
                        >
                          <option value="">Seleccionar</option>
                          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Distrito *</label>
                        <select 
                          required
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          disabled={!formData.province}
                          className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors bg-white disabled:bg-gray-50"
                        >
                          <option value="">Seleccionar</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    {formData.department && formData.province && (
                      <div className="p-4 bg-gray-50 border border-gray-200 flex items-start gap-3">
                        <Truck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold uppercase tracking-tight">
                            {isLimaLima ? "Delivery a Domicilio (Lima Metropolitana)" : "Envío a Provincia vía Shalom"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isLimaLima 
                              ? "Tu pedido será entregado directamente en tu dirección." 
                              : "Tu pedido será enviado a la agencia Shalom de tu localidad para recojo personal."}
                          </p>
                        </div>
                      </div>
                    )}

                    {isLimaLima ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Dirección Exacta *</label>
                          <input 
                            required
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors"
                            placeholder="Av. Principal 123"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Referencia (Opcional)</label>
                          <input 
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors"
                            placeholder="Frente al parque, portón negro..."
                          />
                        </div>
                      </div>
                    ) : formData.department ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">DNI del Receptor *</label>
                          <input 
                            required
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 8) {
                                setFormData({...formData, dni: val});
                              }
                            }}
                            className={`w-full border p-3 outline-none transition-colors ${formData.dni.length === 8 ? 'border-green-500 focus:border-green-600' : 'border-gray-200 focus:border-black'}`}
                            placeholder="12345678"
                          />
                          {formData.dni && formData.dni.length !== 8 && (
                            <p className="text-[9px] text-red-500 font-bold uppercase">Debe tener 8 dígitos</p>
                          )}
                        </div>
                        <div className="bg-blue-50 p-4 border border-blue-100 flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800 leading-relaxed">
                            <strong>Nota:</strong> El pedido se enviará a la agencia <strong>Shalom</strong> más cercana a su localidad. El punto exacto de recojo está sujeto a cambios al momento de generar el envío por el canal de despacho.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-black py-4 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                      >
                        Atrás
                      </button>
                      <button 
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!formData.department || !formData.province || !formData.district || (isLimaLima ? !formData.address : formData.dni.length !== 8)}
                        className="flex-1 bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                      >
                        Resumen Final
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-black tracking-tight uppercase">Método de Pago y Confirmación</h2>
                    
                    <div className="space-y-4">
                      {/* Payment Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, payment_method_choice: 'pay_now'})}
                          className={`p-4 border-2 text-left transition-all rounded-xl relative overflow-hidden ${formData.payment_method_choice === 'pay_now' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          {formData.payment_method_choice === 'pay_now' && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Recomendado</div>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <CreditCard className={`w-5 h-5 ${formData.payment_method_choice === 'pay_now' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className={`font-black uppercase text-xs ${formData.payment_method_choice === 'pay_now' ? 'text-blue-700' : 'text-gray-700'}`}>Pagar Ahora (Directo)</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-tight">Paga mediante Yape/Plin ahora mismo y registra tu número de operación.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({...formData, payment_method_choice: 'pay_later'})}
                          className={`p-4 border-2 text-left transition-all rounded-xl ${formData.payment_method_choice === 'pay_later' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <span className="font-black uppercase text-xs">Pagar por WhatsApp</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-tight">Coordina el pago directamente con un asesor después de generar el pedido.</p>
                        </button>
                      </div>

                      {formData.payment_method_choice === 'pay_now' && (
                        <div className="bg-gray-50 border-2 border-black p-6 rounded-2xl space-y-6 animate-in zoom-in-95 duration-300">
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Escanea para pagar S/ {total.toFixed(2)}</p>
                            <div className="flex items-center justify-center">
                              <div className="space-y-2">
                                {yapeQr ? (
                                  <img 
                                    src={yapeQr} 
                                    alt="QR Yape" 
                                    className="w-48 h-48 border-2 border-black rounded-xl p-1 bg-white mx-auto"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white mx-auto">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">QR no disponible</p>
                                  </div>
                                )}
                                <p className="text-[10px] font-black text-purple-600 uppercase">Yape</p>
                              </div>
                            </div>
                            <div className="mt-6 p-3 bg-white border border-gray-200 rounded-xl">
                              <p className="text-[11px] font-bold text-gray-600">Titular: <span className="text-black">Fortisol Perú SAC</span></p>
                              <p className="text-[11px] font-bold text-gray-600">Número: <span className="text-black">976 791 234</span></p>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                              <p className="text-[11px] font-black text-yellow-800 leading-tight text-center">
                                ⚠️ IMPORTANTE: Envía tu voucher para validar tu envío: <br/>
                                <a 
                                  href="https://wa.me/51990257017" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline"
                                >
                                  👉 wa.me/51990257017 ☀️
                                </a>
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Número de Operación / Código</label>
                            <input 
                              type="text"
                              required={formData.payment_method_choice === 'pay_now'}
                              value={formData.operation_number}
                              onChange={(e) => setFormData({...formData, operation_number: e.target.value})}
                              placeholder="Ej: 12345678"
                              className="w-full border-2 border-black p-4 rounded-xl outline-none focus:bg-yellow-50 transition-all font-black text-center text-lg"
                            />
                            <p className="text-[9px] text-gray-400 text-center uppercase font-bold">Ingresa el código que aparece en tu comprobante de pago</p>
                          </div>
                        </div>
                      )}

                      <div className="border border-gray-200 p-4 rounded-xl">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Resumen de Envío</h3>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-black mt-0.5" />
                          <div className="text-sm">
                            <p className="font-bold">{formData.name}</p>
                            <p className="text-gray-600">{formData.phone}</p>
                            <p className="text-gray-600 mt-2">
                              {isLimaLima 
                                ? `${formData.address}, ${formData.district}, ${formData.province}`
                                : `Envío Shalom: ${formData.district}, ${formData.province}, ${formData.department}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black text-white p-6 flex items-center gap-4 rounded-xl">
                        <ShieldCheck className="w-10 h-10 flex-shrink-0 text-yellow-400" />
                        <div>
                          <p className="font-bold uppercase tracking-tight">Finalizar Pedido</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formData.payment_method_choice === 'pay_now' 
                              ? "Al confirmar, enviaremos tu número de operación por WhatsApp para validar tu pago."
                              : "Al confirmar, coordinaremos el pago y envío por WhatsApp."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 border-2 border-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                      >
                        Atrás
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting || (formData.payment_method_choice === 'pay_now' && !formData.operation_number)}
                        className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${formData.payment_method_choice === 'pay_now' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          formData.payment_method_choice === 'pay_now' ? 'Confirmar Pago' : 'Confirmar Pedido'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Summary Side */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-black tracking-tight uppercase mb-6">Tu Pedido</h2>
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex flex-col gap-1 border-b border-gray-50 pb-3 last:border-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        <span className="font-bold text-black">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="font-medium">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded self-start">
                      {item.variantName}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="text-green-600 font-medium">Por coordinar</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-2 border-t border-black mt-2">
                  <span>TOTAL</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
