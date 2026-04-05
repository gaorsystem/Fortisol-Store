import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Music2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Footer({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Fortisol" className="h-16 mb-6 object-contain" />
            ) : (
              <span className="font-black text-3xl tracking-tighter mb-6 block">FORTISOL<sup className="text-sm">&reg;</sup></span>
            )}
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {settings?.footer_text || 'Empresa que elabora y distribuye suplementos nutricionales y productos de belleza. Salud para toda la vida.'}
            </p>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('admin')}
                className="mt-4 text-xs text-gray-600 hover:text-yellow-400 transition-colors uppercase font-bold tracking-widest"
              >
                Acceso Admin
              </button>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6">Contacto</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>{settings?.whatsapp_number ? `+${settings.whatsapp_number}` : '+51 976 791 234'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>ventas@fortisol.pe</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Cal. El Roble Mza. Pp07 Lote. 04 Apv. Avicop (Loza Deportiva Codorniz) - San Antonio - Huarochiri - Lima - Perú.</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6">Legal</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Libro de Reclamaciones</a></li>
            </ul>
            <div className="mt-8 flex gap-4">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                  <Music2 className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CRECIENDO JUNTOS E.I.R.L. | RUC: 20574762902. Todos los derechos reservados.</p>
          <p>Dirección técnica: Q.F.: Jimmy Daga Pimentel - C.Q.F.P. 06478</p>
        </div>
      </div>
    </footer>
  );
}
