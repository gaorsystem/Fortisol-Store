import React from 'react';
import { ArrowRight, ShieldCheck, Leaf, Activity } from 'lucide-react';
import { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';

interface HomeProps {
  onNavigate: (page: string) => void;
  onProductClick: (product: Product) => void;
  products: Product[];
  slides: any[];
}

export function Home({ onNavigate, onProductClick, products, slides }: HomeProps) {
  // Filter products marked as featured and sort them by their featured_order
  const featuredProducts = products
    .filter(p => p.is_featured)
    .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
    .slice(0, 3);

  // Fallback to first 3 products if no featured products are set
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Carousel Section */}
      <HeroCarousel onNavigate={onNavigate} slides={slides} />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Calidad Garantizada</h3>
              <p className="text-gray-600">Productos auténticos elaborados con ingredientes funcionales de la más alta calidad.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fórmulas Patentadas</h3>
              <p className="text-gray-600">Fórmulas nutracéuticas desarrolladas en nuestro propio laboratorio.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resultados Reales</h3>
              <p className="text-gray-600">Respaldadas por la certificación del Ministerio de Salud para resultados visibles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">PRODUCTOS DESTACADOS</h2>
              <p className="text-gray-600 max-w-2xl">Descubre nuestra selección de suplementos diseñados para mejorar tu calidad de vida.</p>
            </div>
            <button 
              onClick={() => onNavigate('shop')}
              className="hidden md:inline-flex items-center gap-2 text-black font-bold uppercase tracking-wider hover:underline underline-offset-4"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={onProductClick} 
              />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <button 
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-2 border border-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
