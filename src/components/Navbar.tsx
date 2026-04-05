import React from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ cartCount, onCartClick, onNavigate, currentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'home', label: 'Inicio' },
    { id: 'shop', label: 'Tienda' },
    { id: 'about', label: 'Nosotros' },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigate('home')}
              className="flex-shrink-0 flex items-center gap-2"
            >
              <span className="font-black text-3xl tracking-tighter text-black">FORTISOL<sup className="text-sm font-bold">&reg;</sup></span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-black ${
                  currentPage === link.id ? 'text-black border-b-2 border-black pb-1' : 'text-gray-500'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button 
              onClick={onCartClick}
              className="relative p-2 text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-black rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-black"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-black rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`block w-full text-left px-3 py-4 text-base font-medium uppercase tracking-wider ${
                  currentPage === link.id ? 'text-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
