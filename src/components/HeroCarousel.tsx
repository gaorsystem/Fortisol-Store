import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const staticSlides = [
  {
    id: 1,
    title: "BIENESTAR NATURAL PARA TU VIDA",
    subtitle: "Descubre el poder de la naturaleza con nuestros suplementos premium diseñados para tu vitalidad diaria.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=2000",
    cta: "Ver Catálogo"
  },
  {
    id: 2,
    title: "ALIVIO ARTICULAR REAL",
    subtitle: "Flexanil Ultra Forte: La solución definitiva para recuperar tu movilidad y decirle adiós al dolor.",
    image: "https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80&w=2000",
    cta: "Comprar Ahora"
  },
  {
    id: 3,
    title: "ENERGÍA QUE TE IMPULSA",
    subtitle: "Fortisol Fit: Potencia tu metabolismo y alcanza tus metas con energía 100% natural.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2000",
    cta: "Descubrir Más"
  }
];

interface HeroCarouselProps {
  onNavigate: (page: string) => void;
  slides: any[];
}

export function HeroCarousel({ onNavigate, slides: propSlides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const isUsingStatic = propSlides.length === 0;
  const slides = !isUsingStatic ? propSlides.map(s => ({
    id: s.id,
    title: s.title || '',
    subtitle: s.subtitle || '',
    image: s.image_url || s.image || '',
    cta: s.button_text || 'Ver Más'
  })) : staticSlides;

  useEffect(() => {
    if (isUsingStatic) {
      console.warn('HeroCarousel: No se recibieron slides dinámicos, mostrando diapositivas de demostración.');
    }
  }, [isUsingStatic]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000); // Cambia cada 6 segundos
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[80vh] min-h-[600px] bg-black text-white overflow-hidden group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-700">
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-all duration-[10000ms,700ms] ${
                index === current ? 'scale-110' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className={`max-w-2xl transform transition-all duration-1000 delay-300 ${
              index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight uppercase">
                {slide.title.split(' ').map((word, i) => (
                  <React.Fragment key={i}>
                    {word}{' '}
                    {/* Añadir un salto de línea condicional para mejor diseño en el primer slide */}
                    {slide.id === 1 && i === 1 && <br className="hidden md:block" />}
                  </React.Fragment>
                ))}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed">
                {slide.subtitle}
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                {slide.cta}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Controles del Carrusel */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100 border border-white/20 hover:border-white backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100 border border-white/20 hover:border-white backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicadores (Dots) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1 transition-all duration-300 ${
              index === current ? 'w-16 bg-white' : 'w-8 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
