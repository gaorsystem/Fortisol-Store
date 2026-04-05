import React from 'react';
import { ArrowLeft, Check, Info, Package, Activity } from 'lucide-react';
import { Product, ProductVariant } from '../data/products';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, variant: ProductVariant) => void;
}

export function ProductDetail({ product, onBack, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(() => {
    if (product.variants && product.variants.length > 0) {
      // Try to find a variant that is a pack to recommend it by default
      const packVariant = product.variants.find(v => 
        v.name.toLowerCase().includes('pack') || 
        v.name.toLowerCase().includes('x2') || 
        v.name.toLowerCase().includes('x3')
      );
      return packVariant || product.variants[0];
    }
    return { name: 'Unidad', price: product.price || 0 };
  });

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariant);
  };

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Volver a la tienda
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Image and Info Box */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 flex items-center justify-center aspect-square">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="bg-gray-50 p-4">
              <div className="flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-wider mb-0.5">Recomendaciones</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Evitar el consumo en exceso de carne roja, alcohol, gaseosa, café y dulces por las noches. 
                    Es importante tomar 2 litros de agua y utilizar el saltarín o una caminata durante 20-60 mins al día.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Product Info */}
          <div className="flex flex-col">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {product.category}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-2">
              {product.name}
            </h1>
            <p className="text-xl font-medium text-black mb-4">
              S/ {selectedVariant.price.toFixed(2)}
            </p>
            
            <div className="text-sm text-gray-600 leading-relaxed mb-5 whitespace-pre-wrap">
              {product.description}
            </div>

            {/* Variants Selection */}
            {product.variants && (
              <div className="mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  Opciones de Compra
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((variant) => {
                    const isPack = variant.name.toLowerCase().includes('pack') || 
                                   variant.name.toLowerCase().includes('x2') || 
                                   variant.name.toLowerCase().includes('x3');
                    return (
                      <button
                        key={variant.name}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 border text-left transition-all relative overflow-hidden flex flex-col justify-center min-h-[70px] ${
                          selectedVariant.name === variant.name
                            ? 'border-black bg-black text-white shadow-lg scale-[1.02]'
                            : isPack 
                              ? 'border-yellow-400 bg-yellow-50/30 hover:border-black text-gray-700'
                              : 'border-gray-200 hover:border-black text-gray-600'
                        }`}
                      >
                        {isPack && (
                          <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${
                            selectedVariant.name === variant.name ? 'bg-white text-black' : 'bg-yellow-400 text-black'
                          }`}>
                            RECOMENDADO
                          </div>
                        )}
                        <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${
                          selectedVariant.name === variant.name ? 'text-gray-300' : 'text-gray-400'
                        }`}>
                          {variant.name}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black leading-none">S/ {variant.price.toFixed(2)}</span>
                        </div>
                        {isPack && (
                          <p className={`text-[8px] mt-1 font-bold ${
                            selectedVariant.name === variant.name ? 'text-yellow-400' : 'text-yellow-600'
                          }`}>
                            ¡Mejor Valor por tu Dinero!
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2.5">Beneficios Principales</h3>
              <ul className="space-y-1.5">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white border-t border-gray-100 lg:relative lg:bottom-0 lg:p-0 lg:border-0 lg:bg-transparent z-40">
              <div className="max-w-5xl mx-auto flex gap-3">
                <div className="flex items-center border border-gray-300 bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors py-3 lg:py-2 shadow-lg lg:shadow-none"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
