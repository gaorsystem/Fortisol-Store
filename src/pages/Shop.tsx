import React from 'react';
import { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';

interface ShopProps {
  onProductClick: (product: Product) => void;
  products: Product[];
}

export function Shop({ onProductClick, products }: ShopProps) {
  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category)))];
  const [activeCategory, setActiveCategory] = React.useState("Todos");

  const filteredProducts = activeCategory === "Todos" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">NUESTRA TIENDA</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora nuestra línea completa de suplementos nutricionales y aceites esenciales. 
            Salud para toda la vida.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeCategory === category 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={onProductClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
