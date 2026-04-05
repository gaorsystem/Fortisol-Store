import React from 'react';
import { Product } from '../data/products';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  key?: string | number;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div 
      onClick={() => onClick(product)}
      className="group cursor-pointer flex flex-col bg-white border border-gray-200 hover:border-black transition-colors duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 p-6">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
          {product.category}
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[15px] font-bold text-black mb-0.5 leading-tight">{product.name}</h3>
        <p className="text-[10px] text-gray-500 mb-2 line-clamp-1">{product.tagline}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-black text-black">S/ {product.price.toFixed(2)}</span>
          <button className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
