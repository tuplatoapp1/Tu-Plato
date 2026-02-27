import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, ShoppingCart, Star, Clock, Info, ChevronRight, Phone, MapPin, Instagram, Facebook, Plus, Minus, X, Utensils, ArrowLeft, CheckCircle, Navigation } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MENU_ITEMS, MenuItem } from '../data/menu';
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
  const { branding, offers, isLoading } = usePublicMenu();
  const { isAuthenticated } = useAuth();
  const [currentOffer, setCurrentOffer] = useState(0);
  const [activeCategory, setActiveCategory] = useState('entradas');
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
    let orderText = `*Nuevo Pedido - ${branding.restaurantName}*\n\n`;
    orderText += `*Cliente:* ${customerInfo.firstName} ${customerInfo.lastName}\n`;
    orderText += `*Cédula:* ${customerInfo.documentId}\n`;
    orderText += `*Teléfono:* ${customerInfo.phone}\n\n`;
    
    orderText += `*Dirección:* ${locationInfo.address || 'No especificada'}\n`;
    if (locationInfo.mapLink) {
      orderText += `*Ubicación Maps:* ${locationInfo.mapLink}\n`;
    }
    orderText += `\n*Pedido:*\n`;
    cart.forEach(c => {
      orderText += `- ${c.quantity}x ${c.menuItem.name} ($${(c.menuItem.price * c.quantity).toFixed(2)})\n`;
    });
    orderText += `\n*Subtotal: $${totalPrice.toFixed(2)}* (Sin incluir delivery)\n`;

    const encodedText = encodeURIComponent(orderText);
    
    // Número solicitado por el usuario: 04243556185 (Código de país 58 para Venezuela)
    const targetNumber = '584243556185';
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
    setCart(prev => prev.map(c => {
      if (c.menuItem.id === id) {
        const newQ = c.quantity + delta;
        return newQ > 0 ? { ...c, quantity: newQ } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
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

  const filteredItems = MENU_ITEMS.filter(item => item.category === activeCategory);

  // Helper to render logo
  const renderLogo = () => {
    if (branding.logoType === 'image' && branding.logoValue) {
      return (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
          <img 
            src={branding.logoValue} 
            alt="Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
      );
    }
    
    // @ts-ignore
    const Icon = LucideIcons[branding.logoValue] || ChefHat;
    return (
      <div className="bg-white p-1.5 rounded-lg shadow-sm">
        <Icon className="w-6 h-6 text-tuplato" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tuplato"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 relative">
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
            {renderLogo()}
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
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
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 capitalize">
            {CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {filteredItems.length} opciones
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 overflow-hidden relative group active:scale-[0.98] transition-transform duration-200"
            >
              {/* Image */}
              <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!item.isAvailable ? 'grayscale' : ''}`}
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase border border-white/50 px-2 py-1 rounded backdrop-blur-sm">
                      Agotado
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    <span className="font-bold text-tuplato shrink-0">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold text-gray-700">4.8</span>
                    <span className="text-[10px] text-gray-400 font-normal">(24)</span>
                  </div>
                  
                  {item.isAvailable && (
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-tuplato hover:bg-tuplato hover:text-white transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No hay platos disponibles en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white mt-8 py-8 border-t border-gray-100">
        <div className="max-w-md mx-auto px-6 space-y-6">
          <div className="flex justify-center gap-6">
            {branding.socialLinks?.instagram && (
              <a href={branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {branding.socialLinks?.facebook && (
              <a href={branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {branding.socialLinks?.whatsapp && (
              <a href={branding.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:text-tuplato hover:bg-tuplato/10 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
          
          <div className="text-center space-y-3">
            {branding.schedule?.map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-tuplato" />
                <span><span className="font-bold">{item.days}:</span> {item.hours}</span>
              </div>
            ))}
            
            {branding.address && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
                <MapPin className="w-4 h-4 text-tuplato" />
                <span>{branding.address}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">© 2024 {branding.restaurantName}. Todos los derechos reservados.</p>
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
              className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                  {checkoutStep > 0 && (
                    <button onClick={() => setCheckoutStep(prev => prev - 1)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {checkoutStep === 0 && <><ShoppingCart className="w-5 h-5 text-tuplato" /> Tu Pedido</>}
                    {checkoutStep === 1 && <><Info className="w-5 h-5 text-tuplato" /> Tus Datos</>}
                    {checkoutStep === 2 && <><MapPin className="w-5 h-5 text-tuplato" /> Tu Ubicación</>}
                  </h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {checkoutStep === 0 && (
                  cart.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>Tu carrito está vacío</p>
                    </div>
                  ) : (
                    cart.map(c => (
                      <div key={c.menuItem.id} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative pr-10">
                        <button 
                          onClick={() => removeFromCart(c.menuItem.id)}
                          className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar producto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img src={c.menuItem.image} alt={c.menuItem.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm line-clamp-1 pr-2">{c.menuItem.name}</h4>
                          <p className="text-tuplato font-bold text-sm">${(c.menuItem.price * c.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <button onClick={() => updateQuantity(c.menuItem.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-tuplato">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{c.quantity}</span>
                          <button onClick={() => updateQuantity(c.menuItem.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-tuplato">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={customerInfo.firstName} 
                        onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Tu nombre" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <input 
                        type="text" 
                        value={customerInfo.lastName} 
                        onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Tu apellido" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / ID</label>
                      <input 
                        type="text" 
                        value={customerInfo.documentId} 
                        onChange={e => setCustomerInfo({...customerInfo, documentId: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
                        placeholder="Número de documento" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                      <input 
                        type="tel" 
                        value={customerInfo.phone} 
                        onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none" 
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
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors font-bold"
                    >
                      <Navigation className="w-5 h-5" />
                      {isLocating ? 'Obteniendo ubicación...' : 'Compartir mi ubicación actual'}
                    </button>
                    
                    {locationInfo.mapLink && (
                      <div className="text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-200 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-5 h-5 text-green-500" /> 
                        Ubicación obtenida correctamente
                      </div>
                    )}
                    
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">O ingresa tu dirección</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Zona</label>
                      <textarea 
                        rows={3} 
                        value={locationInfo.address} 
                        onChange={e => setLocationInfo({...locationInfo, address: e.target.value})} 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato outline-none resize-none" 
                        placeholder="Ej: Barrio Centro, Calle 123, Casa 4. Referencia: Frente al parque." 
                      />
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  {checkoutStep === 0 && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">
                          Subtotal
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">Sin incluir delivery</span>
                        </span>
                        <span className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
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
