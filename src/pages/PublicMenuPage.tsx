import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, ShoppingCart, Star, Clock, Info, ChevronRight, Phone, MapPin, Instagram, Facebook, Plus, Minus, X, Utensils, ArrowLeft, CheckCircle, Navigation, Search, Flame, Leaf, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MENU_ITEMS, MenuItem, MenuTag } from '../data/menu';
import { usePublicMenu } from '../context/PublicMenuContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'entradas', label: 'Entradas' },
  { id: 'principales', label: 'Platos Fuertes' },
  { id: 'postres', label: 'Postres' },
  { id: 'bebidas', label: 'Bebidas' },
];

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function PublicMenuPage() {
  const { branding, offers, menuItems, categories, tags, isLoading } = usePublicMenu();
  const { isAuthenticated } = useAuth();
  const [currentOffer, setCurrentOffer] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'entradas');
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Cart, 1: Info, 2: Location
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    documentId: '',
    phone: ''
  });
  const [locationInfo, setLocationInfo] = useState({
    address: '',
    mapLink: ''
  });
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setLocationInfo(prev => ({ ...prev, mapLink: link }));
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert('No se pudo obtener la ubicación. Por favor, asegúrate de dar permisos a tu navegador.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
      setIsLocating(false);
    }
  };

  const handleFinishOrder = () => {
    // Use configured template or default
    const template = branding.whatsappMessageTemplate || 
      "*Nuevo Pedido - {restaurantName}*\n\n" +
      "*Cliente:* {customerName}\n" +
      "*Cédula:* {customerDocumentId}\n" +
      "*Teléfono:* {customerPhone}\n\n" +
      "*Dirección:* {address}\n" +
      "{mapLink}\n" +
      "\n*Pedido:*\n" +
      "{orderItems}\n" +
      "\n*Subtotal: ${totalPrice}* (Sin incluir delivery)\n";

    const orderItemsText = cart.map(c => `- ${c.quantity}x ${c.menuItem.name} ($${(c.menuItem.price * c.quantity).toFixed(2)})`).join('\n');
    const mapLinkText = locationInfo.mapLink ? `*Ubicación Maps:* ${locationInfo.mapLink}` : '';
    
    let message = template
      .replace('{restaurantName}', branding.restaurantName)
      .replace('{customerName}', `${customerInfo.firstName} ${customerInfo.lastName}`)
      .replace('{customerDocumentId}', customerInfo.documentId)
      .replace('{customerPhone}', customerInfo.phone)
      .replace('{address}', locationInfo.address || 'No especificada')
      .replace('{mapLink}', mapLinkText)
      .replace('{orderItems}', orderItemsText)
      .replace('{totalPrice}', totalPrice.toFixed(2));

    const encodedText = encodeURIComponent(message);
    
    // Use configured number or default
    const targetNumber = branding.whatsappNumber || '584243556185';
    const waLink = `https://wa.me/${targetNumber}?text=${encodedText}`;
    
    window.open(waLink, '_blank');
    
    // Reset
    setCart([]);
    setCheckoutStep(0);
    setIsCartOpen(false);
    setCustomerInfo({ firstName: '', lastName: '', documentId: '', phone: '' });
    setLocationInfo({ address: '', mapLink: '' });
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.menuItem.id === id) {
          return { ...c, quantity: c.quantity + delta };
        }
        return c;
      }).filter(c => c.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  useEffect(() => {
    if (offers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      const yOffset = -140; // Adjust for sticky header and category nav
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Intersection Observer for Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-150px 0px -60% 0px' }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref && ref instanceof Element) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const renderTagBadge = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return null;

    const colorClasses = {
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const colorClass = colorClasses[tag.color as keyof typeof colorClasses] || colorClasses.gray;

    return (
      <span key={tag.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
        {/* @ts-ignore */}
        {React.createElement(LucideIcons[tag.icon] || LucideIcons.Tag, { className: "w-3 h-3" })}
        {tag.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tuplato"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20 relative transition-colors duration-200">
      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="bg-tuplato text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 hover:bg-tuplato-dark transition-transform hover:scale-105"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="font-bold text-sm">Ver Pedido (${totalPrice.toFixed(2)})</span>
          </button>
        </div>
      )}

      {/* Top Banner - Tu Plato */}
      <header className="bg-tuplato shadow-md sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoType === 'image' && branding.logoValue ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                <img src={branding.logoValue} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="bg-white p-1.5 rounded-lg shadow-sm">
                {/* @ts-ignore */}
                {React.createElement(LucideIcons[branding.logoValue] || ChefHat, { className: "w-6 h-6 text-tuplato" })}
              </div>
            )}
            <span className="font-bold text-xl text-white tracking-tight">{branding.restaurantName}</span>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-tuplato pb-4 px-4 shadow-md relative z-30">
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar hamburguesa, cerveza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-10 pr-10 rounded-xl border-none bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Carousel */}
      {offers.length > 0 ? (
        <div className="relative h-64 sm:h-80 overflow-hidden bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOffer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={offers[currentOffer].image} 
                alt={offers[currentOffer].title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${offers[currentOffer].color} mix-blend-multiply opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white z-10">
            <motion.div
              key={`text-${currentOffer}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/30">
                Oferta Especial
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-1">
                {offers[currentOffer].title}
              </h2>
              <p className="text-white/90 text-lg font-light">
                {offers[currentOffer].subtitle}
              </p>
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentOffer(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentOffer ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-20 bg-gray-900 flex items-center justify-center text-white/50 text-sm">
          Sin ofertas activas
        </div>
      )}

      {/* Category Navigation */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto overflow-x-auto no-scrollbar py-3 px-4 flex gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all transform ${
                activeCategory === cat.id
                  ? 'bg-tuplato text-white shadow-lg shadow-tuplato/30 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-10">
        {categories.map(category => {
          const categoryItems = menuItems.filter(item => 
            item.category === category.id && 
            (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (categoryItems.length === 0) return null;

          return (
            <div 
              key={category.id} 
              id={category.id} 
              ref={el => categoryRefs.current[category.id] = el}
              className="scroll-mt-40"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight">
                  {category.label}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {categoryItems.length} opciones
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {categoryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 overflow-hidden relative group active:scale-[0.98] transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white leading-tight text-lg">{item.name}</h4>
                            <span className="font-black text-gray-900 dark:text-white whitespace-nowrap text-lg">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                            {item.description}
                          </p>
                          {/* Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.tags.map(tag => renderTagBadge(tag))}
                            </div>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <div className="flex justify-end mt-auto">
                          {cart.find(c => c.menuItem.id === item.id) ? (
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-full p-1 border border-gray-100 dark:border-gray-600">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-sm w-4 text-center dark:text-white">
                                {cart.find(c => c.menuItem.id === item.id)?.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-full bg-tuplato text-white shadow-sm flex items-center justify-center hover:bg-tuplato-dark transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!item.isAvailable}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                                item.isAvailable 
                                  ? 'bg-tuplato text-white hover:bg-tuplato-dark shadow-md shadow-tuplato/20' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {searchTerm && categories.every(category => 
          menuItems.filter(item => 
            item.category === category.id && 
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()))
          ).length === 0
        ) && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">No se encontraron resultados</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Intenta con otra búsqueda</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white dark:bg-gray-900 mt-8 py-8 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-md mx-auto px-6 space-y-6">
          <div className="flex justify-center gap-6">
            {branding.socialLinks?.instagram && (
              <a href={branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-tuplato dark:hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {branding.socialLinks?.facebook && (
              <a href={branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-tuplato dark:hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {branding.socialLinks?.whatsapp && (
              <a href={branding.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-tuplato dark:hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
          
          <div className="text-center space-y-3">
            {branding.schedule?.map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 text-tuplato" />
                <span><span className="font-bold dark:text-gray-300">{item.days}:</span> {item.hours}</span>
              </div>
            ))}
            
            {branding.address && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2">
                <MapPin className="w-4 h-4 text-tuplato" />
                <span>{branding.address}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">© 2024 {branding.restaurantName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md h-full flex flex-col shadow-2xl transition-colors duration-200"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  {checkoutStep > 0 && (
                    <button onClick={() => setCheckoutStep(prev => prev - 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                    {checkoutStep === 0 && <><ShoppingCart className="w-5 h-5 text-tuplato" /> Tu Pedido</>}
                    {checkoutStep === 1 && <><Info className="w-5 h-5 text-tuplato" /> Tus Datos</>}
                    {checkoutStep === 2 && <><MapPin className="w-5 h-5 text-tuplato" /> Tu Ubicación</>}
                  </h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {checkoutStep === 0 && (
                  cart.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p>Tu carrito está vacío</p>
                    </div>
                  ) : (
                    cart.map(c => (
                      <div key={c.menuItem.id} className="flex gap-3 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative pr-10">
                        <button 
                          onClick={() => removeFromCart(c.menuItem.id)}
                          className="absolute top-2 right-2 p-1 text-gray-300 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                          title="Eliminar producto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img src={c.menuItem.image} alt={c.menuItem.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm line-clamp-1 pr-2 dark:text-white">{c.menuItem.name}</h4>
                          <p className="text-tuplato font-bold text-sm">${(c.menuItem.price * c.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                          <button onClick={() => updateQuantity(c.menuItem.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-300 hover:text-tuplato">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center dark:text-white">{c.quantity}</span>
                          <button onClick={() => updateQuantity(c.menuItem.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-300 hover:text-tuplato">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={customerInfo.firstName} 
                        onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Tu nombre" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                      <input 
                        type="text" 
                        value={customerInfo.lastName} 
                        onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Tu apellido" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula / ID</label>
                      <input 
                        type="text" 
                        value={customerInfo.documentId} 
                        onChange={e => setCustomerInfo({...customerInfo, documentId: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Número de documento" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono de Contacto</label>
                      <input 
                        type="tel" 
                        value={customerInfo.phone} 
                        onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Tu número de celular" 
                      />
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-5">
                    <button 
                      onClick={handleGetLocation} 
                      disabled={isLocating} 
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-bold"
                    >
                      <Navigation className="w-5 h-5" />
                      {isLocating ? 'Obteniendo ubicación...' : 'Compartir mi ubicación actual'}
                    </button>
                    
                    {locationInfo.mapLink && (
                      <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800/50 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-5 h-5 text-green-500" /> 
                        Ubicación obtenida correctamente
                      </div>
                    )}
                    
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm font-medium">O ingresa tu dirección</span>
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección / Zona</label>
                      <textarea 
                        rows={3} 
                        value={locationInfo.address} 
                        onChange={e => setLocationInfo({...locationInfo, address: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none resize-none" 
                        placeholder="Ej: Barrio Centro, Calle 123, Casa 4. Referencia: Frente al parque." 
                      />
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {checkoutStep === 0 && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Subtotal
                          <span className="block text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5">Sin incluir delivery</span>
                        </span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => setCheckoutStep(1)}
                        className="w-full bg-tuplato text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-tuplato/30 hover:bg-tuplato-dark transition-colors"
                      >
                        Continuar
                      </button>
                    </>
                  )}
                  
                  {checkoutStep === 1 && (
                    <button 
                      onClick={() => setCheckoutStep(2)}
                      disabled={!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone}
                      className="w-full bg-tuplato text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-tuplato/30 hover:bg-tuplato-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente Paso
                    </button>
                  )}

                  {checkoutStep === 2 && (
                    <button 
                      onClick={handleFinishOrder}
                      disabled={!locationInfo.address && !locationInfo.mapLink}
                      className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Enviar Pedido por WhatsApp
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
