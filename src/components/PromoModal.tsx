import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PromoModalProps {
  offers: any[];
}

export function PromoModal({ offers }: PromoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mostrar el popup después de 3 segundos si hay ofertas
    const timer = setTimeout(() => {
      if (offers.length > 0 || !offers) {
        setIsOpen(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [offers]);

  if (!isOpen) return null;

  const activeOffer = offers.length > 0 ? offers[0] : {
    title: "15% DE DESCUENTO",
    image_url: "https://images.unsplash.com/photo-1611078813354-150247071661?auto=format&fit=crop&q=80&w=800",
    subtitle: "Obtén un descuento especial en tu primera compra de la línea de suplementos FORTISOL. Usa el código al finalizar tu pedido.",
    code: "FORTISOL15"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-black bg-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="aspect-square relative bg-gray-100 group/image overflow-hidden">
          <img
            src={activeOffer.image_url || activeOffer.image}
            alt={activeOffer.title}
            className="w-full h-full object-cover hover:scale-105 transition-all duration-700 cursor-pointer"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
            <span className="text-white font-bold tracking-widest uppercase text-xs mb-2 border border-white/30 inline-block w-fit px-2 py-1">
              Oferta Exclusiva
            </span>
            <h2 className="text-4xl font-black text-white leading-none tracking-tighter uppercase">
              {activeOffer.title}
            </h2>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {activeOffer.subtitle || activeOffer.description || "Obtén un descuento especial en tu primera compra de la línea de suplementos FORTISOL."}
          </p>
          
          {activeOffer.code && (
            <div className="bg-gray-50 p-4 font-mono text-2xl font-black tracking-widest mb-6 border-2 border-dashed border-black text-black">
              {activeOffer.code}
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
          >
            Aprovechar Oferta
          </button>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-4 text-xs text-gray-400 hover:text-black uppercase tracking-wider underline underline-offset-4"
          >
            No por ahora, gracias
          </button>
        </div>
      </div>
    </div>
  );
}
