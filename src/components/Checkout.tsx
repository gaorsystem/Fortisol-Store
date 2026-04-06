import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Truck, MapPin, User, Phone, CreditCard, ShieldCheck, Info, Loader2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dni: '',
    department: '',
    province: '',
    district: '',
    address: '',
    reference: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number')
        .eq('id', 1)
        .single();
      if (data?.whatsapp_number) setBusinessPhone(data.whatsapp_number);
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
          status: 'pending',
          items: items,
          order_custom_id: orderId,
          customer_dni: formData.dni,
          shipping_method: isLimaLima ? 'delivery' : 'shalom',
          source: 'web_store'
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
      `------------------------------------------\n\n` +
      `_Pedido generado desde la tienda web Fortisol Perú._\n` +
      `_Por favor, confírmenme el pedido para proceder con el pago._`;

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
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors"
                          placeholder="987654321"
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.name || !formData.phone}
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
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 p-3 focus:border-black outline-none transition-colors"
                            placeholder="12345678"
                            maxLength={8}
                          />
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
                        disabled={!formData.department || !formData.province || !formData.district || (isLimaLima ? !formData.address : !formData.dni)}
                        className="flex-1 bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                      >
                        Resumen Final
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-black tracking-tight uppercase">Confirmar Pedido</h2>
                    
                    <div className="space-y-4">
                      <div className="border border-gray-200 p-4">
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
                            {!isLimaLima && (
                              <p className="text-[10px] text-gray-400 mt-1 italic">Recojo en la agencia más cercana.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-black text-white p-6 flex items-center gap-4">
                        <ShieldCheck className="w-10 h-10 flex-shrink-0" />
                        <div>
                          <p className="font-bold uppercase tracking-tight">Compra 100% Segura</p>
                          <p className="text-xs text-gray-400 mt-1">Al hacer clic, te redirigiremos a nuestro WhatsApp oficial para coordinar el pago y confirmar tu envío.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 border border-black py-4 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                      >
                        Atrás
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 text-white py-4 font-bold uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          'Confirmar por WhatsApp'
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
