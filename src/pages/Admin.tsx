import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layout, 
  Tag, 
  ShoppingCart, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Upload,
  Loader2,
  Lock,
  LogIn,
  CreditCard,
  FileText,
  User as UserIcon,
  Download,
  Settings as SettingsIcon,
  MessageCircle,
  QrCode
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';

type Tab = 'products' | 'slides' | 'offers' | 'orders' | 'crm' | 'settings';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  // Fetch data based on active tab
  const fetchData = async () => {
    if (!isAuthenticated && activeTab !== 'settings') return;
    
    setLoading(true);
    try {
      if (activeTab === 'settings') {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
        } else {
          const fetchedSettings = data || {
            id: 1,
            whatsapp_number: '51976791234',
            facebook_url: '',
            instagram_url: '',
            tiktok_url: '',
            logo_url: '',
            yape_qr_url: '',
            yape_owner: 'Fortisol Perú SAC',
            yape_phone: '976 791 234',
            footer_text: 'Fortisol Perú - Calidad y Confianza'
          };
          
          // Ensure fields exist even if column is missing in DB
          if (fetchedSettings) {
            if (fetchedSettings.yape_qr_url === undefined) fetchedSettings.yape_qr_url = '';
            if (fetchedSettings.yape_owner === undefined) fetchedSettings.yape_owner = 'Fortisol Perú SAC';
            if (fetchedSettings.yape_phone === undefined) fetchedSettings.yape_phone = '976 791 234';
          }
          
          setSettings(fetchedSettings);
        }
        return;
      }

      let table = '';
      switch (activeTab) {
        case 'products': table = 'products'; break;
        case 'slides': table = 'slides'; break;
        case 'offers': table = 'offers'; break;
        case 'orders': table = 'orders'; break;
        case 'crm': table = 'customers'; break;
      }

      if (!table) return;

      if (activeTab === 'offers') {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, price');
        setProducts(productsData || []);
      }

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${table}:`, error);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error('Error en fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${activeTab}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fortisol-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fortisol-assets')
        .getPublicUrl(filePath);

      setEditingItem({ ...editingItem, [activeTab === 'products' ? 'image_url' : 'image_url']: publicUrl });
    } catch (error: any) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;

    let table = '';
    switch (activeTab) {
      case 'products': table = 'products'; break;
      case 'slides': table = 'slides'; break;
      case 'offers': table = 'offers'; break;
      case 'orders': table = 'orders'; break;
      case 'crm': table = 'customers'; break;
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar: ' + (error.message || JSON.stringify(error)));
    } else {
      fetchData();
    }
  };

  const downloadLabel = (order: any) => {
    console.log('Iniciando generación de etiqueta para pedido:', order);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const companyName = settings?.footer_text?.split('-')[0]?.trim() || 'FORTISOL PERÚ';

      const drawLabelContent = (yOffset: number, labelTitle: string) => {
        // Borde principal
        doc.setLineWidth(0.8);
        doc.rect(10, yOffset, 190, 130);

        // Cabecera (Origen/Destino)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`ORIGEN: LIMA`, 15, yOffset + 12);
        doc.text(`DESTINO: ${(order.province || order.customer_province || order.district || 'LIMA').toUpperCase()}`, 110, yOffset + 12);
        
        doc.setLineWidth(0.5);
        doc.line(10, yOffset + 18, 200, yOffset + 18);

        // Sección Destinatario
        doc.setFontSize(20);
        doc.text('DESTINATARIO:', 15, yOffset + 30);
        
        doc.setFontSize(12);
        doc.text('NOMBRE COMPLETO:', 20, yOffset + 42);
        doc.setFont('helvetica', 'normal');
        doc.text((order.customer_name || order.name || '-').toUpperCase(), 75, yOffset + 42);

        doc.setFont('helvetica', 'bold');
        doc.text('DNI:', 20, yOffset + 52);
        doc.setFont('helvetica', 'normal');
        doc.text(order.customer_dni || order.dni || '-', 75, yOffset + 52);

        doc.setFont('helvetica', 'bold');
        doc.text('CEL.:', 20, yOffset + 62);
        doc.setFont('helvetica', 'normal');
        doc.text(order.customer_phone || order.phone || '-', 75, yOffset + 62);

        doc.setFont('helvetica', 'bold');
        doc.text('DIRECCIÓN:', 20, yOffset + 72);
        doc.setFont('helvetica', 'normal');
        const address = `${order.customer_address || order.address || '-'} - ${order.district || order.customer_district || '-'}`;
        const splitAddress = doc.splitTextToSize(address, 115);
        doc.text(splitAddress, 75, yOffset + 72);

        doc.setLineWidth(0.5);
        doc.line(10, yOffset + 95, 200, yOffset + 95);

        // Pie de etiqueta (N° Pedido)
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        const orderCode = order.order_custom_id || order.order_number || order.id.substring(0, 8);
        doc.text(`N° DE PEDIDO: ${orderCode}`, 15, yOffset + 110);
        
        doc.setFontSize(10);
        doc.text(companyName.toUpperCase(), 15, yOffset + 120);

        // Indicador de copia
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(labelTitle, 195, yOffset + 127, { align: 'right' });
        doc.setTextColor(0);

        // Icono de FRÁGIL (Copa)
        const iconX = 160;
        const iconY = yOffset + 98;
        doc.setLineWidth(0.8);
        doc.rect(iconX, iconY, 25, 25); // Cuadro grande para Frágil
        
        // Dibujar una copa simple (Estilo lineal para evitar errores de función)
        doc.setLineWidth(0.5);
        // Boca de la copa
        doc.line(iconX + 7, iconY + 5, iconX + 18, iconY + 5); 
        // Lados de la copa (V-shape)
        doc.line(iconX + 7, iconY + 5, iconX + 9, iconY + 14);
        doc.line(iconX + 18, iconY + 5, iconX + 16, iconY + 14);
        // Fondo de la copa
        doc.line(iconX + 9, iconY + 14, iconX + 16, iconY + 14);
        // Tallo
        doc.line(iconX + 12.5, iconY + 14, iconX + 12.5, iconY + 19);
        // Base
        doc.line(iconX + 9, iconY + 19, iconX + 16, iconY + 19);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('FRÁGIL', iconX + 12.5, iconY + 23.5, { align: 'center' });
      };

      // Dibujar primera etiqueta (Cargo)
      drawLabelContent(10, 'COPIA: CARGO (CONTROL)');
      
      // Línea de corte
      doc.setLineDashPattern([2, 2], 0);
      doc.line(0, 148.5, 210, 148.5);
      doc.setLineDashPattern([], 0);

      // Dibujar segunda etiqueta (Paquete)
      drawLabelContent(155, 'COPIA: PAQUETE (CLIENTE)');

      doc.save(`etiqueta_${order.order_number || order.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === 'settings') {
      console.log('Guardando configuración:', settings);
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          whatsapp_number: settings.whatsapp_number,
          facebook_url: settings.facebook_url,
          instagram_url: settings.instagram_url,
          tiktok_url: settings.tiktok_url,
          logo_url: settings.logo_url,
          yape_qr_url: settings.yape_qr_url,
          yape_owner: settings.yape_owner,
          yape_phone: settings.yape_phone,
          footer_text: settings.footer_text
        });

      if (error) {
        console.error('Error Supabase Settings:', error);
        alert('Error al guardar configuración: ' + error.message);
      } else {
        alert('Configuración guardada correctamente');
        await fetchData();
      }
      setLoading(false);
      return;
    }

    let table = '';
    switch (activeTab) {
      case 'products': table = 'products'; break;
      case 'slides': table = 'slides'; break;
      case 'offers': table = 'offers'; break;
      case 'orders': table = 'orders'; break;
      case 'crm': table = 'customers'; break;
    }

    const itemToSave = { ...editingItem };
    if (!itemToSave.id || itemToSave.id === '') {
      delete itemToSave.id;
    }

    if (activeTab === 'products') {
      itemToSave.price = parseFloat(itemToSave.price as any) || 0;
      
      // Ensure image_url is the primary field for the database
      if (itemToSave.image && !itemToSave.image_url) {
        itemToSave.image_url = itemToSave.image;
      }

      // STRATEGIC FIX: The user's Supabase schema is missing several columns.
      // We will strip ALL non-essential columns that are causing errors.
      // This allows saving the basic product even if the DB is not fully configured.
      const essentialFields = [
        'id', 'name', 'price', 'description', 'category', 'image_url', 'created_at',
        'is_featured', 'badge_text', 'featured_order', 'benefits', 'variants', 'ingredients', 'stock'
      ];
      
      Object.keys(itemToSave).forEach(key => {
        if (!essentialFields.includes(key)) {
          delete itemToSave[key];
        }
      });

      console.log('Guardando producto con campos esenciales:', itemToSave);
    }

    if (activeTab === 'offers') {
      const essentialFields = [
        'id', 'title', 'subtitle', 'image_url', 'is_active', 'show_in_popup', 'product_id', 'created_at'
      ];
      
      Object.keys(itemToSave).forEach(key => {
        if (!essentialFields.includes(key)) {
          delete itemToSave[key];
        }
      });
    }

    if (activeTab === 'orders') {
      // STRATEGIC FIX: Strip fields that might be missing in the DB schema
      const essentialFields = [
        'id', 'order_number', 'order_custom_id', 'source', 'customer_name', 'customer_phone', 'customer_dni', 
        'customer_address', 'district', 'province', 'department', 'reference',
        'shipping_method', 'payment_method', 'total', 'status', 'items', 'created_at', 'admin_notes', 'train_station'
      ];
      
      Object.keys(itemToSave).forEach(key => {
        if (!essentialFields.includes(key)) {
          delete itemToSave[key];
        }
      });
    }

    if (activeTab === 'crm') {
      const essentialFields = [
        'id', 'name', 'phone', 'dni', 'address', 'district', 'province', 'created_at'
      ];
      
      Object.keys(itemToSave).forEach(key => {
        if (!essentialFields.includes(key)) {
          delete itemToSave[key];
        }
      });
    }

    const { error } = await supabase
      .from(table)
      .upsert(itemToSave);

    if (error) {
      console.error('Error detallado de base de datos:', error);
      alert('Error de Base de Datos: ' + (error.message || JSON.stringify(error)));
    } else {
      setEditingItem(null);
      setIsAdding(false);
      fetchData();
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paid': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password protection for the portal
    if (password === 'fortisol2024') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-black">Portal Administrativo</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Fortisol Perú - Acceso Restringido</p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all font-bold ${loginError ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-black bg-gray-50'}`}
                  />
                </div>
                {loginError && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Contraseña incorrecta</p>}
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
              >
                <LogIn className="w-5 h-5" />
                Entrar al Sistema
              </button>
            </form>
          </div>
          
          <p className="text-center mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Fortisol Perú • Seguridad de Datos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10 font-sans text-[13px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">Panel Administrativo</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Fortisol Perú • Gestión de Contenidos</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {showInstallBtn && (
              <button 
                onClick={handleInstallClick}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-4 md:py-3 rounded-2xl md:rounded-xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg active:scale-95"
              >
                <Download className="w-5 h-5" />
                Instalar App
              </button>
            )}
            <button 
              onClick={() => {
                let defaultItem: any = {};
                if (activeTab === 'products') {
                  defaultItem = {
                    name: '',
                    price: 0,
                    description: '',
                    category: 'General',
                    tagline: '',
                    presentation: '',
                    benefits: [],
                    variants: [
                      { name: 'Unidad', price: 0 },
                      { name: 'Pack x2', price: 0 }
                    ]
                  };
                } else if (activeTab === 'orders') {
                  const lastId = localStorage.getItem('fortisol_manual_order_count') || '0';
                  const nextId = parseInt(lastId) + 1;
                  localStorage.setItem('fortisol_manual_order_count', nextId.toString());
                  defaultItem = {
                    order_custom_id: `PWF-${nextId.toString().padStart(4, '0')}`,
                    status: 'pending',
                    source: 'manual_admin',
                    items: []
                  };
                }
                setEditingItem(defaultItem);
                setIsAdding(true);
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-6 py-4 md:py-3 rounded-2xl md:rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Nuevo {activeTab === 'products' ? 'Producto' : activeTab === 'slides' ? 'Slide' : activeTab === 'offers' ? 'Oferta' : activeTab === 'crm' ? 'Cliente' : 'Pedido'}
            </button>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <Package className="w-5 h-5" />
            Productos
          </button>
          <button 
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'slides' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <Layout className="w-5 h-5" />
            Slider
          </button>
          <button 
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'offers' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <Tag className="w-5 h-5" />
            Ofertas
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            Pedidos
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'crm' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <UserIcon className="w-5 h-5" />
            Clientes (CRM)
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            Configuración
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl md:rounded-2xl border-2 border-black overflow-hidden shadow-xl">
          {(activeTab === 'crm' || activeTab === 'orders') && (
            <div className="p-4 border-b-2 border-black bg-gray-50 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder={activeTab === 'crm' ? "Buscar cliente por nombre o teléfono..." : "Buscar pedido por nombre, teléfono o ID..."}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          {loading && ((activeTab !== 'settings' && !items.length) || (activeTab === 'settings' && !settings)) ? (
            <div className="p-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-black rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-bold">Cargando datos...</p>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="p-6 md:p-10">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-yellow-400 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <SettingsIcon className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Configuración General</h2>
                    <p className="text-xs text-gray-500 font-medium">Gestiona los enlaces y la identidad de tu tienda</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Número de WhatsApp</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+</div>
                          <input 
                            type="text" 
                            value={settings?.whatsapp_number || ''}
                            onChange={e => setSettings({...settings, whatsapp_number: e.target.value})}
                            placeholder="51900000000"
                            className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold bg-gray-50"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 ml-1 italic">Incluye código de país (Ej: 51 para Perú)</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Logo de la Tienda</label>
                        <div className="flex items-center gap-4">
                          {settings?.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-contain border-2 border-black p-1 bg-white" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <div className="bg-black text-white px-4 py-3 rounded-xl text-xs font-bold text-center hover:bg-gray-800 transition-all">
                              {uploading ? 'Subiendo...' : 'Cambiar Logo'}
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `logo-${Date.now()}.${fileExt}`;
                                  const { error: uploadError } = await supabase.storage
                                    .from('fortisol-assets')
                                    .upload(`settings/${fileName}`, file);
                                  if (uploadError) throw uploadError;
                                  const { data: { publicUrl } } = supabase.storage
                                    .from('fortisol-assets')
                                    .getPublicUrl(`settings/${fileName}`);
                                  setSettings({...settings, logo_url: publicUrl});
                                } catch (err: any) {
                                  alert('Error: ' + err.message);
                                } finally {
                                  setUploading(false);
                                }
                              }} 
                            />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">QR de Yape (Pago Directo)</label>
                        <div className="flex items-center gap-4">
                          {settings?.yape_qr_url ? (
                            <img src={settings.yape_qr_url} alt="QR Yape" className="w-14 h-14 rounded-xl object-contain border-2 border-black p-1 bg-white" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <QrCode className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <div className="bg-black text-white px-4 py-3 rounded-xl text-xs font-bold text-center hover:bg-gray-800 transition-all">
                              {uploading ? 'Subiendo...' : 'Subir QR Yape'}
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `yape-qr-${Date.now()}.${fileExt}`;
                                  const { error: uploadError } = await supabase.storage
                                    .from('fortisol-assets')
                                    .upload(`settings/${fileName}`, file);
                                  if (uploadError) throw uploadError;
                                  const { data: { publicUrl } } = supabase.storage
                                    .from('fortisol-assets')
                                    .getPublicUrl(`settings/${fileName}`);
                                  setSettings({...settings, yape_qr_url: publicUrl});
                                } catch (err: any) {
                                  alert('Error: ' + err.message);
                                } finally {
                                  setUploading(false);
                                }
                              }} 
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Titular de Yape</label>
                        <input 
                          type="text" 
                          value={settings?.yape_owner || ''}
                          onChange={e => setSettings({...settings, yape_owner: e.target.value})}
                          placeholder="Ej: Fortisol Perú SAC"
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Número de Yape</label>
                        <input 
                          type="text" 
                          value={settings?.yape_phone || ''}
                          onChange={e => setSettings({...settings, yape_phone: e.target.value})}
                          placeholder="Ej: 976 791 234"
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">Redes Sociales</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Facebook</label>
                          <input 
                            type="url" 
                            value={settings?.facebook_url || ''}
                            onChange={e => setSettings({...settings, facebook_url: e.target.value})}
                            placeholder="https://facebook.com/..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all text-xs font-bold bg-gray-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Instagram</label>
                          <input 
                            type="url" 
                            value={settings?.instagram_url || ''}
                            onChange={e => setSettings({...settings, instagram_url: e.target.value})}
                            placeholder="https://instagram.com/..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all text-xs font-bold bg-gray-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">TikTok</label>
                          <input 
                            type="url" 
                            value={settings?.tiktok_url || ''}
                            onChange={e => setSettings({...settings, tiktok_url: e.target.value})}
                            placeholder="https://tiktok.com/@..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all text-xs font-bold bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Texto del Footer</label>
                      <textarea 
                        value={settings?.footer_text || ''}
                        onChange={e => setSettings({...settings, footer_text: e.target.value})}
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold bg-gray-50 h-24 resize-none"
                        placeholder="Escribe el texto que aparecerá en el pie de página..."
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-[0_6px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none border-2 border-black flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Guardar Cambios
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-black">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Info</th>
                      {activeTab === 'orders' && (
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Código</th>
                      )}
                      {activeTab === 'products' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Precio</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Stock</th>
                        </>
                      )}
                      {activeTab === 'offers' && (
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Precio</th>
                      )}
                      {activeTab === 'orders' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Cliente</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Envío</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Pago</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Total</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Estado</th>
                        </>
                      )}
                      {activeTab === 'crm' && (
                        <>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Cliente</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">DNI</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Ubicación</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Pedidos</th>
                        </>
                      )}
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items
                      .filter(item => {
                        if (!searchTerm) return true;
                        const search = searchTerm.toLowerCase();
                        return (
                          (item.name?.toLowerCase().includes(search)) ||
                          (item.customer_name?.toLowerCase().includes(search)) ||
                          (item.phone?.toLowerCase().includes(search)) ||
                          (item.customer_phone?.toLowerCase().includes(search)) ||
                          (item.order_custom_id?.toLowerCase().includes(search))
                        );
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {activeTab === 'orders' ? (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            ) : (
                              (item.image_url || item.image) && (
                                <img 
                                  src={item.image_url || item.image} 
                                  alt="" 
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                  referrerPolicy="no-referrer"
                                />
                              )
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-black">{item.name || item.title || (activeTab === 'orders' ? 'Detalle de Pedido' : `#${item.order_number}`)}</div>
                                {activeTab === 'orders' && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    item.source === 'asistente_sol' || item.order_custom_id?.startsWith('WSP-') 
                                      ? 'bg-green-100 text-green-700 border border-green-200' 
                                      : item.order_custom_id?.startsWith('PTF-')
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                                  }`}>
                                    {item.source === 'asistente_sol' || item.order_custom_id?.startsWith('WSP-') ? 'WhatsApp' : item.order_custom_id?.startsWith('PTF-') ? 'Web' : 'Admin'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description || item.subtitle || item.customer_phone}</div>
                            </div>
                          </div>
                        </td>
                        {activeTab === 'orders' && (
                          <td className="px-6 py-4 font-black text-black text-sm">
                            {item.order_custom_id || item.order_number || item.id.substring(0, 8)}
                          </td>
                        )}
                        {activeTab === 'products' && (
                          <>
                            <td className="px-6 py-4 font-black text-black">S/. {item.price}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {item.stock} unid.
                              </span>
                            </td>
                          </>
                        )}
                        {activeTab === 'offers' && (
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              {(() => {
                                const product = products.find(p => p.id === item.product_id);
                                if (product) {
                                  return (
                                    <>
                                      <span className="font-black text-black">S/. {product.variants?.[0]?.price || product.price}</span>
                                      {product.price > (product.variants?.[0]?.price || product.price) && (
                                        <span className="text-[10px] text-gray-400 line-through">S/. {product.price}</span>
                                      )}
                                    </>
                                  );
                                }
                                return <span className="text-[10px] text-gray-400 italic">Sin producto</span>;
                              })()}
                            </div>
                          </td>
                        )}
                        {activeTab === 'orders' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold">{item.customer_name}</div>
                              <a 
                                href={`https://wa.me/51${(item.customer_phone || '').replace(/\s/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {item.customer_phone}
                              </a>
                              <div className="text-[10px] text-gray-400">DNI: {item.customer_dni || 'No reg.'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded self-start ${item.shipping_method === 'shalom' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {item.shipping_method === 'shalom' ? 'Shalom' : 'Estación Tren'}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-1 font-bold">
                                  {item.shipping_method === 'shalom' ? `${item.district}, ${item.province}` : (item.train_station || 'Estación no reg.')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold uppercase text-[11px] text-gray-700">{item.payment_method || 'No reg.'}</span>
                                {item.admin_notes && (
                                  <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded self-start ${item.admin_notes.includes('Operación') ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-gray-400 truncate max-w-[120px]'}`}>
                                    {item.admin_notes}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-black text-black">S/. {item.total}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <span className="text-xs font-bold uppercase">{getStatusLabel(item.status)}</span>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'crm' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold">{item.name}</div>
                              <a 
                                href={`https://wa.me/51${(item.phone || '').replace(/\s/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {item.phone}
                              </a>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-600">{item.dni || '-'}</td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold">{item.district}, {item.province}</div>
                              <div className="text-[10px] text-gray-400">{item.address}</div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => {
                                  // This would ideally open a modal with order history
                                  alert(`Historial de pedidos para ${item.name} próximamente...`);
                                }}
                                className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full hover:bg-black hover:text-white transition-all"
                              >
                                Ver Historial
                              </button>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {activeTab === 'orders' && (
                              <button 
                                onClick={() => downloadLabel(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Descargar Etiqueta"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {items
                  .filter(item => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return (
                      (item.name?.toLowerCase().includes(search)) ||
                      (item.customer_name?.toLowerCase().includes(search)) ||
                      (item.phone?.toLowerCase().includes(search)) ||
                      (item.customer_phone?.toLowerCase().includes(search)) ||
                      (item.order_custom_id?.toLowerCase().includes(search))
                    );
                  })
                  .map((item) => (
                    <div key={item.id} className="p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      {(item.image_url || item.image) && (
                        <img 
                          src={item.image_url || item.image} 
                          alt="" 
                          className="w-16 h-16 rounded-xl object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-black text-sm uppercase tracking-tight truncate">{item.name || item.title || `#${item.order_number}`}</div>
                        <div className="text-[10px] text-gray-500 line-clamp-1 mb-1">{item.description || item.subtitle || item.customer_phone}</div>
                        
                        {activeTab === 'products' && (
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black">S/. {item.price}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Stock: {item.stock}
                            </span>
                          </div>
                        )}

                        {activeTab === 'orders' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.customer_name}</span>
                              <span className="font-black text-black">S/. {item.total}</span>
                            </div>
                            {item.admin_notes && (
                              <div className={`text-[9px] font-bold px-2 py-1 rounded border ${item.admin_notes.includes('Operación') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                {item.admin_notes}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${item.shipping_method === 'shalom' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.shipping_method === 'shalom' ? 'Shalom' : 'Estación Tren'}
                              </span>
                              <span className="text-[9px] font-bold text-gray-500">
                                {item.shipping_method === 'shalom' ? item.district : (item.train_station || 'Estación no reg.')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              <span className="text-[10px] font-black uppercase tracking-tighter">{getStatusLabel(item.status)}</span>
                            </div>
                          </div>
                        )}

                        {activeTab === 'crm' && (
                          <div className="space-y-1">
                            <div className="font-black text-black text-sm uppercase">{item.name}</div>
                            <div className="text-[10px] text-gray-500">{item.phone} • DNI: {item.dni || '-'}</div>
                            <div className="text-[10px] text-gray-400 font-bold">{item.district}, {item.province}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'orders' && (
                        <button 
                          onClick={() => downloadLabel(item)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Etiqueta
                        </button>
                      )}
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs active:scale-95 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-[50] flex items-center justify-around px-2 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'products' ? 'text-black scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'products' ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Productos</span>
        </button>
        <button 
          onClick={() => setActiveTab('slides')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'slides' ? 'text-black scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'slides' ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
            <Layout className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Slider</span>
        </button>
        <button 
          onClick={() => setActiveTab('offers')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'offers' ? 'text-black scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'offers' ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Ofertas</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'orders' ? 'text-black scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'orders' ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Pedidos</span>
        </button>
        <button 
          onClick={() => setActiveTab('crm')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'crm' ? 'text-black scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'crm' ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
            <UserIcon className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Clientes</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-black scale-110' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'settings' ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
            <SettingsIcon className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Ajustes</span>
        </button>
      </div>

      {/* Edit Modal */}
      {(editingItem || isAdding) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center md:p-4">
          <div className="bg-white md:rounded-3xl border-2 border-black w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
            <div className="sticky top-0 z-10 p-6 border-b-2 border-black flex justify-between items-center bg-yellow-400">
              <h2 className="text-xl font-black text-black uppercase tracking-tight">
                {isAdding ? 'Nuevo' : 'Editar'} {activeTab === 'products' ? 'Producto' : activeTab === 'slides' ? 'Slide' : activeTab === 'offers' ? 'Oferta' : 'Pedido'}
              </h2>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="p-2 hover:bg-black/10 rounded-full transition-all">
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {activeTab === 'products' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Nombre</label>
                      <input 
                        type="text" 
                        required
                        value={editingItem?.name || ''} 
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Precio Base (S/.)</label>
                      <input 
                        type="number" 
                        required
                        value={editingItem?.price || ''} 
                        onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Stock Disponible</label>
                      <input 
                        type="number" 
                        value={editingItem?.stock || 0} 
                        onChange={e => setEditingItem({...editingItem, stock: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="is_featured"
                        checked={editingItem?.is_featured || false} 
                        onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})}
                        className="w-5 h-5 accent-black"
                      />
                      <label htmlFor="is_featured" className="text-sm font-black uppercase text-black cursor-pointer">Producto Destacado (Aparece en Inicio)</label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500">Etiqueta (Ej: Más Vendido)</label>
                        <input 
                          type="text" 
                          placeholder="Más Vendido, Oferta, etc."
                          value={editingItem?.badge_text || ''} 
                          onChange={e => setEditingItem({...editingItem, badge_text: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500">Orden en Destacados (1-3)</label>
                        <input 
                          type="number" 
                          min="1"
                          max="10"
                          value={editingItem?.featured_order || 0} 
                          onChange={e => setEditingItem({...editingItem, featured_order: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Eslogan (Tagline)</label>
                    <input 
                      type="text" 
                      value={editingItem?.tagline || ''} 
                      onChange={e => setEditingItem({...editingItem, tagline: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Descripción (Se respetarán los saltos de línea)</label>
                    <textarea 
                      value={editingItem?.description || ''} 
                      onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold h-32"
                      placeholder="Escribe la descripción aquí..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Ingredientes</label>
                    <textarea 
                      value={editingItem?.ingredients || ''} 
                      onChange={e => setEditingItem({...editingItem, ingredients: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold h-20"
                      placeholder="Ej: Colágeno hidrolizado, Magnesio..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Categoría</label>
                      <input 
                        type="text" 
                        value={editingItem?.category || ''} 
                        onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1 opacity-50">
                      <label className="text-xs font-black uppercase text-gray-500">Presentación (Deshabilitado - Error de Esquema)</label>
                      <input 
                        type="text" 
                        disabled
                        placeholder="Columna no encontrada en DB"
                        value={editingItem?.presentation || ''} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 outline-none font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Beneficios (Uno por línea)</label>
                    <textarea 
                      value={Array.isArray(editingItem?.benefits) ? editingItem.benefits.join('\n') : ''} 
                      onChange={e => setEditingItem({...editingItem, benefits: e.target.value.split('\n').filter(b => b.trim())})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold h-24"
                      placeholder="Beneficio 1&#10;Beneficio 2..."
                    />
                  </div>

                  <div className="space-y-2 border-2 border-black/5 p-4 rounded-2xl bg-gray-50">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase text-gray-500">Variantes / Opciones de Compra</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const currentVariants = Array.isArray(editingItem?.variants) ? editingItem.variants : [];
                          setEditingItem({
                            ...editingItem, 
                            variants: [...currentVariants, { name: '', price: editingItem?.price || 0 }]
                          });
                        }}
                        className="text-[10px] font-black uppercase bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition-all"
                      >
                        + Agregar Variante
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(Array.isArray(editingItem?.variants) ? editingItem.variants : []).map((variant: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200">
                          <input 
                            type="text" 
                            placeholder="Nombre (Ej: Pack x2)"
                            value={variant.name}
                            onChange={e => {
                              const newVariants = [...editingItem.variants];
                              newVariants[idx].name = e.target.value;
                              setEditingItem({...editingItem, variants: newVariants});
                            }}
                            className="flex-1 px-3 py-2 text-xs font-bold border-b border-gray-100 outline-none focus:border-black"
                          />
                          <input 
                            type="number" 
                            placeholder="Precio"
                            value={variant.price}
                            onChange={e => {
                              const newVariants = [...editingItem.variants];
                              newVariants[idx].price = parseFloat(e.target.value) || 0;
                              setEditingItem({...editingItem, variants: newVariants});
                            }}
                            className="w-24 px-3 py-2 text-xs font-bold border-b border-gray-100 outline-none focus:border-black"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newVariants = editingItem.variants.filter((_: any, i: number) => i !== idx);
                              setEditingItem({...editingItem, variants: newVariants});
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(Array.isArray(editingItem?.variants) ? editingItem.variants : []).length === 0 && (
                        <p className="text-[10px] text-gray-400 italic text-center py-2">No hay variantes configuradas. Se usará el precio base.</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Imagen del Producto</label>
                    <div className="flex items-center gap-4">
                      {editingItem?.image_url && (
                        <img 
                          src={editingItem.image_url} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-xl object-cover border-2 border-black"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-black transition-all cursor-pointer bg-gray-50">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-[10px] font-bold uppercase text-gray-500">Subir Imagen</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="O pega una URL externa"
                      value={editingItem?.image_url || ''} 
                      onChange={e => setEditingItem({...editingItem, image_url: e.target.value})}
                      className="w-full mt-2 px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all text-xs font-bold"
                    />
                  </div>
                </>
              )}

              {activeTab === 'slides' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Título</label>
                    <input 
                      type="text" 
                      placeholder="Ej: TÚ BIENESTAR ES NUESTRA PRIORIDAD"
                      value={editingItem?.title || ''} 
                      onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Subtítulo</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Imagina un cuerpo lleno de vitalidad..."
                      value={editingItem?.subtitle || ''} 
                      onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Imagen del Slide</label>
                    <div className="flex items-center gap-4">
                      {editingItem?.image_url && (
                        <img 
                          src={editingItem.image_url} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-xl object-cover border-2 border-black"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-black transition-all cursor-pointer bg-gray-50">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-[10px] font-bold uppercase text-gray-500">Subir Imagen</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="O pega una URL externa"
                      value={editingItem?.image_url || ''} 
                      onChange={e => setEditingItem({...editingItem, image_url: e.target.value})}
                      className="w-full mt-2 px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Texto Botón</label>
                      <input 
                        type="text" 
                        value={editingItem?.button_text || ''} 
                        onChange={e => setEditingItem({...editingItem, button_text: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Link Botón</label>
                      <input 
                        type="text" 
                        value={editingItem?.button_link || ''} 
                        onChange={e => setEditingItem({...editingItem, button_link: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'offers' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Título de Oferta</label>
                    <input 
                      type="text" 
                      required
                      value={editingItem?.title || ''} 
                      onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Imagen de la Oferta</label>
                    <div className="flex items-center gap-4">
                      {editingItem?.image_url && (
                        <img 
                          src={editingItem.image_url} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-xl object-cover border-2 border-black"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-black transition-all cursor-pointer bg-gray-50">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-[10px] font-bold uppercase text-gray-500">Subir Imagen</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="O pega una URL externa"
                      value={editingItem?.image_url || ''} 
                      onChange={e => setEditingItem({...editingItem, image_url: e.target.value})}
                      className="w-full mt-2 px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Producto Vinculado</label>
                    <select 
                      value={editingItem?.product_id || ''} 
                      onChange={e => setEditingItem({...editingItem, product_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (S/. {p.price})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-400 italic">Se usará el precio configurado en el producto seleccionado.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingItem?.is_active || false} 
                        onChange={e => setEditingItem({...editingItem, is_active: e.target.checked})}
                        className="w-5 h-5 accent-black"
                      />
                      <span className="text-sm font-bold">Activa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingItem?.show_in_popup || false} 
                        onChange={e => setEditingItem({...editingItem, show_in_popup: e.target.checked})}
                        className="w-5 h-5 accent-black"
                      />
                      <span className="text-sm font-bold">Mostrar en Pop-up</span>
                    </label>
                  </div>
                </>
              )}
              
              {activeTab === 'crm' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        value={editingItem?.name || ''} 
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Teléfono / WhatsApp</label>
                      <input 
                        type="text" 
                        required
                        value={editingItem?.phone || ''} 
                        onChange={e => setEditingItem({...editingItem, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">DNI / Documento</label>
                      <input 
                        type="text" 
                        value={editingItem?.dni || ''} 
                        onChange={e => setEditingItem({...editingItem, dni: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Dirección</label>
                      <input 
                        type="text" 
                        value={editingItem?.address || ''} 
                        onChange={e => setEditingItem({...editingItem, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Distrito</label>
                      <input 
                        type="text" 
                        value={editingItem?.district || ''} 
                        onChange={e => setEditingItem({...editingItem, district: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Provincia</label>
                      <input 
                        type="text" 
                        value={editingItem?.province || ''} 
                        onChange={e => setEditingItem({...editingItem, province: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Código de Pedido</label>
                      <input 
                        type="text" 
                        required
                        value={editingItem?.order_custom_id || ''} 
                        onChange={e => setEditingItem({...editingItem, order_custom_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold"
                        placeholder="PTF-0001 o PWF-0001"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Estado del Pedido</label>
                      <select 
                        value={editingItem?.status || 'pending'} 
                        onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold bg-white"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-gray-500">Método de Pago</label>
                      <select 
                        value={editingItem?.payment_method || ''} 
                        onChange={e => setEditingItem({...editingItem, payment_method: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold bg-white"
                      >
                        <option value="">Seleccionar</option>
                        <option value="yape">Yape</option>
                        <option value="plin">Plin</option>
                        <option value="transferencia">Transferencia BCP/BBVA</option>
                        <option value="efectivo">Efectivo (Contraentrega)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500">Notas Administrativas (Código Transacción, etc.)</label>
                    <textarea 
                      value={editingItem?.admin_notes || ''} 
                      onChange={e => setEditingItem({...editingItem, admin_notes: e.target.value})}
                      placeholder="Ej: Transacción #123456 - Pagado por Juan"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-all font-bold h-20"
                    />
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border-2 border-black/5 space-y-4">
                    <div className="text-xs font-black uppercase text-yellow-600 flex items-center gap-2">
                      <UserIcon className="w-3 h-3" />
                      Detalles del Cliente y Envío
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Nombre del Cliente</div>
                        <input 
                          type="text" 
                          value={editingItem?.customer_name || ''} 
                          onChange={e => setEditingItem({...editingItem, customer_name: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Teléfono / WhatsApp</div>
                        <input 
                          type="text" 
                          value={editingItem?.customer_phone || ''} 
                          onChange={e => setEditingItem({...editingItem, customer_phone: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200/50">
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">DNI / Documento</div>
                        <input 
                          type="text" 
                          value={editingItem?.customer_dni || ''} 
                          onChange={e => setEditingItem({...editingItem, customer_dni: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Método de Envío</div>
                        <select 
                          value={editingItem?.shipping_method || 'delivery'} 
                          onChange={e => setEditingItem({...editingItem, shipping_method: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm bg-white"
                        >
                          <option value="delivery">Estación del Tren (Lima)</option>
                          <option value="shalom">Shalom (Provincia)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/50">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">
                        {editingItem?.shipping_method === 'shalom' ? 'Agencia Shalom' : 'Estación del Tren / Punto de Entrega'}
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <input 
                            type="text" 
                            placeholder={editingItem?.shipping_method === 'shalom' ? 'Ej: Agencia Central Shalom' : 'Ej: Estación Arriola'}
                            value={editingItem?.train_station || editingItem?.shipping_agency || editingItem?.customer_address || ''} 
                            onChange={e => setEditingItem({
                              ...editingItem, 
                              train_station: e.target.value,
                              customer_address: e.target.value // Backup
                            })}
                            className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Distrito</div>
                            <input 
                              type="text" 
                              value={editingItem?.district || ''} 
                              onChange={e => setEditingItem({...editingItem, district: e.target.value})}
                              className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Provincia</div>
                            <input 
                              type="text" 
                              value={editingItem?.province || ''} 
                              onChange={e => setEditingItem({...editingItem, province: e.target.value})}
                              className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Departamento</div>
                            <input 
                              type="text" 
                              value={editingItem?.department || ''} 
                              onChange={e => setEditingItem({...editingItem, department: e.target.value})}
                              className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      {editingItem?.reference && (
                        <div className="mt-1 text-[11px] bg-yellow-100 p-2 rounded-lg border border-yellow-200">
                          <span className="font-black uppercase text-[9px] block text-yellow-700">Referencia:</span>
                          {editingItem.reference}
                        </div>
                      )}
                    </div>

                    {editingItem?.items && (
                      <div className="pt-4 border-t-2 border-dashed border-gray-200">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Productos en el Pedido</div>
                        <div className="space-y-2">
                          {(() => {
                            let orderItems = [];
                            try {
                              if (Array.isArray(editingItem.items)) {
                                orderItems = editingItem.items;
                              } else if (typeof editingItem.items === 'string') {
                                try {
                                  const parsed = JSON.parse(editingItem.items);
                                  orderItems = Array.isArray(parsed) ? parsed : [parsed];
                                } catch (e) {
                                  // If it's a string but not JSON, maybe it's just the product name
                                  orderItems = [editingItem.items];
                                }
                              } else if (typeof editingItem.items === 'object' && editingItem.items !== null) {
                                orderItems = [editingItem.items];
                              } else {
                                orderItems = [];
                              }
                            } catch (e) {
                              orderItems = [];
                            }
                            
                            if (!Array.isArray(orderItems)) orderItems = [];

                            return orderItems.map((prod: any, i: number) => {
                              let name = 'Producto';
                              let quantity = 1;
                              let price = 0;
                              let variant = '';

                              if (typeof prod === 'string') {
                                name = prod;
                              } else if (typeof prod === 'object' && prod !== null) {
                                name = prod.name || prod.producto || prod.product || prod.title || prod.item || prod.desc || 'Producto';
                                quantity = Number(prod.quantity || prod.cantidad || prod.qty || 1);
                                price = Number(prod.price || prod.precio || prod.unit_price || prod.amount || prod.subtotal || 0);
                                variant = prod.variantName || prod.variante || prod.variant || '';
                              }

                              return (
                                <div key={i} className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold">{quantity}x {name}</span>
                                    {variant && <span className="text-[9px] text-gray-400 font-bold uppercase">{variant}</span>}
                                  </div>
                                  <span className="font-black text-xs">S/ {(price * quantity).toFixed(2)}</span>
                                </div>
                              );
                            });
                          })()}
                          <div className="flex justify-between items-center pt-2 px-2">
                            <span className="text-xs font-black uppercase">Total del Pedido</span>
                            <span className="text-lg font-black text-green-600">S/ {Number(editingItem.total || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setEditingItem(null); setIsAdding(false); }}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-black bg-yellow-400 hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
