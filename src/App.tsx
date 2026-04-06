import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Cart, CartItem } from './components/Cart';
import { PromoModal } from './components/PromoModal';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { Checkout } from './components/Checkout';
import { Product, ProductVariant, products as staticProducts } from './data/products';
import SolChat from './components/SolChat';
import { supabase } from './lib/supabase';
import { Home as HomeIcon, ShoppingBag as ShopIcon, Info as InfoIcon, User as AdminIcon, ShoppingCart } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dynamic data from Supabase
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      console.log('Iniciando carga de datos desde Supabase...');
      try {
        // Fetch Products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error al cargar productos:', productsError);
          throw productsError;
        }
        
        console.log(`Productos cargados: ${productsData?.length || 0}`);

        // Map Supabase product to our Product interface
        const mappedProducts: Product[] = (productsData || []).map(p => {
          // ... (rest of the mapping logic remains the same)
          const basePrice = parseFloat(p.price) || 0;
          const rawVariants = Array.isArray(p.variants) ? p.variants : [];
          
          let variants: ProductVariant[] = [{ name: "Unidad", price: basePrice }];
          
          rawVariants.forEach((v: any) => {
            const vName = v.name || 'Opción';
            if (vName.toLowerCase() !== 'unidad') {
              variants.push({
                name: vName,
                price: parseFloat(v.price) || basePrice
              });
            }
          });

          return {
            id: p.id,
            name: p.name || 'Producto sin nombre',
            tagline: p.tagline || '',
            description: p.description || '',
            benefits: p.benefits || [],
            ingredients: p.ingredients || '',
            presentation: p.presentation || '',
            image: p.image_url || p.image || '',
            price: basePrice,
            category: p.category || 'General',
            is_featured: p.is_featured || false,
            badge_text: p.badge_text || '',
            featured_order: p.featured_order || 0,
            variants: variants
          };
        });

        setProducts(mappedProducts.length > 0 ? mappedProducts : staticProducts);
        if (mappedProducts.length === 0) {
          console.warn('No se encontraron productos en la base de datos, usando datos estáticos.');
        }

        // Fetch Slides
        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (slidesError) {
          console.error('Error al cargar slides:', slidesError);
        } else {
          console.log(`Slides cargados: ${slidesData?.length || 0}`);
          setSlides(slidesData || []);
        }

        // Fetch Offers
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true);
        
        if (offersError) {
          console.error('Error al cargar ofertas:', offersError);
        } else {
          console.log(`Ofertas activas cargadas: ${offersData?.length || 0}`);
          setOffers(offersData || []);
        }

      } catch (error) {
        console.error('Error crítico al cargar datos:', error);
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setIsCartOpen(false);
    window.scrollTo(0, 0);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product: Product, quantity: number, variant: ProductVariant) => {
    const cartItemId = `${product.id}-${variant.name}`;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: variant.price,
        quantity: quantity,
        variantName: variant.name,
        presentation: product.presentation
      };
      
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setCurrentPage('home');
    setIsCartOpen(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePromoAccept = (offer: any) => {
    // Buscar el producto vinculado o usar Flexanil como fallback
    const promoProduct = (offer.product_id && products.find(p => p.id === offer.product_id)) || 
                        products.find(p => p.name.toLowerCase().includes('flexanil')) || 
                        products[0];

    if (promoProduct) {
      const variant = promoProduct.variants[0];
      const specialPrice = offer.offer_price || variant.price;
      
      // Generar un ID único para el item de promo para evitar colisiones
      const cartItemId = `${promoProduct.id}-PROMO-${offer.id || 'default'}`;
      
      setCartItems(prev => {
        const existing = prev.find(item => item.id === cartItemId);
        if (existing) {
          return prev.map(item => 
            item.id === cartItemId 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        const newItem: CartItem = {
          id: cartItemId,
          productId: promoProduct.id,
          name: `${promoProduct.name} (OFERTA)`,
          image: promoProduct.image,
          price: specialPrice,
          quantity: 1,
          variantName: "Oferta Especial",
          presentation: promoProduct.presentation
        };
        
        return [...prev, newItem];
      });
      setIsCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 selection:bg-black selection:text-white">
      <PromoModal 
        offers={offers.map(offer => {
          const product = products.find(p => p.id === offer.product_id);
          if (product) {
            const variantPrice = product.variants?.[0]?.price || product.price;
            return {
              ...offer,
              offer_price: variantPrice,
              original_price: product.price > variantPrice ? product.price : null
            };
          }
          return offer;
        })} 
        onAccept={handlePromoAccept} 
      />
      
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage === 'product' || currentPage === 'checkout' ? 'shop' : currentPage}
      />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home 
            onNavigate={handleNavigate} 
            onProductClick={handleProductClick} 
            products={products}
            slides={slides}
          />
        )}
        {currentPage === 'shop' && (
          <Shop onProductClick={handleProductClick} products={products} />
        )}
        {currentPage === 'about' && (
          <About />
        )}
        {currentPage === 'admin' && (
          <Admin />
        )}
        {currentPage === 'product' && selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => handleNavigate('shop')}
            onAddToCart={handleAddToCart}
          />
        )}
        {currentPage === 'checkout' && (
          <Checkout 
            items={cartItems} 
            onBack={() => setIsCartOpen(true)}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => handleNavigate('checkout')}
      />

      {/* Mobile Bottom Navigation Bar (Store) */}
      <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentPage === 'home' ? 'text-black' : 'text-gray-400'}`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Inicio</span>
        </button>
        <button 
          onClick={() => handleNavigate('shop')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentPage === 'shop' || currentPage === 'product' ? 'text-black' : 'text-gray-400'}`}
        >
          <ShopIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Tienda</span>
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-gray-400 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Carrito</span>
        </button>
        <button 
          onClick={() => handleNavigate('about')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentPage === 'about' ? 'text-black' : 'text-gray-400'}`}
        >
          <InfoIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Nosotros</span>
        </button>
        <button 
          onClick={() => handleNavigate('admin')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentPage === 'admin' ? 'text-black' : 'text-gray-400'}`}
        >
          <AdminIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Admin</span>
        </button>
      </div>

      {!isCartOpen && <SolChat onNavigate={handleNavigate} />}
    </div>
  );
}
