import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Mail, Phone, Calendar, CreditCard, Star, Trophy, X, MapPin, Crown, ShoppingBag, Clock, TrendingUp, MessageSquare, Heart } from 'lucide-react';
import { Input } from './ui/Input';
import { Order } from '../types';

interface Customer {
  id: string;
  username: string;
  name: string;
  lastName?: string;
  documentId?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  points?: number;
  xp?: number;
  registeredAt?: string;
  address?: string;
}

const XP_LEVELS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export default function UserListTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load customers from localStorage
    const storedCustomers = JSON.parse(localStorage.getItem('registered_customers') || '[]');
    
    // Add some mock data if empty for demonstration
    if (storedCustomers.length === 0) {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          username: 'juan.perez@email.com',
          name: 'Juan',
          lastName: 'Pérez',
          documentId: '123456789',
          phone: '+1 234 567 8900',
          email: 'juan.perez@email.com',
          birthDate: '1990-05-15',
          points: 1250,
          xp: 3400, // VIP Level 6
          registeredAt: '2025-11-20T10:00:00Z',
          address: 'Av. Principal 123, Ciudad'
        },
        {
          id: '2',
          username: 'maria.gomez@email.com',
          name: 'María',
          lastName: 'Gómez',
          documentId: '987654321',
          phone: '+1 987 654 3210',
          email: 'maria.gomez@email.com',
          birthDate: '1988-10-22',
          points: 450,
          xp: 1200, // Level 5
          registeredAt: '2026-01-15T14:30:00Z',
          address: 'Calle Secundaria 456, Barrio Sur'
        },
        {
          id: '3',
          username: 'carlos.lopez@email.com',
          name: 'Carlos',
          lastName: 'López',
          documentId: '456123789',
          phone: '+1 456 123 7890',
          email: 'carlos.lopez@email.com',
          birthDate: '1995-03-08',
          points: 3200,
          xp: 8500, // VIP Level 9
          registeredAt: '2025-08-05T09:15:00Z',
          address: 'Plaza Central 789, Depto 4B'
        }
      ];
      setCustomers(mockCustomers);
      localStorage.setItem('registered_customers', JSON.stringify(mockCustomers));
    } else {
      setCustomers(storedCustomers);
    }

    // Load orders
    const storedOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
    setCustomerOrders(storedOrders);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const searchString = `${customer.name} ${customer.lastName || ''} ${customer.email || ''} ${customer.documentId || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getCustomerLevel = (xp: number = 0) => {
    let currentLevel = 1;
    for (let i = 0; i < XP_LEVELS.length; i++) {
      if (xp >= XP_LEVELS[i]) {
        currentLevel = i + 1;
      }
    }
    return currentLevel;
  };

  const isVIP = (xp: number = 0) => getCustomerLevel(xp) >= 6;

  // Calculate VIP stats for selected customer
  const vipStats = useMemo(() => {
    if (!selectedCustomer) return null;
    
    const orders = customerOrders.filter(o => o.userId === selectedCustomer.username);
    const totalOrders = orders.length;
    
    if (totalOrders === 0) return { totalOrders: 0, lastOrder: null, topDishes: [], topModifications: [], frequency: 'Sin pedidos' };

    // Sort orders by date descending
    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastOrder = orders[0].date;

    // Calculate frequency (days between first and last order / total orders)
    const firstOrderDate = new Date(orders[orders.length - 1].date).getTime();
    const lastOrderDate = new Date(orders[0].date).getTime();
    const daysDiff = (lastOrderDate - firstOrderDate) / (1000 * 3600 * 24);
    const frequency = totalOrders > 1 ? `Cada ${Math.max(1, Math.round(daysDiff / totalOrders))} días` : '1 pedido';

    // Calculate top dishes and common modifications
    const dishCounts: Record<string, number> = {};
    const modificationCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
        
        if (item.notes) {
          // Split notes by comma, trim, and convert to lowercase for better matching
          const notes = item.notes.split(',').map(n => n.trim().toLowerCase()).filter(n => n.length > 0);
          notes.forEach(note => {
            modificationCounts[note] = (modificationCounts[note] || 0) + 1;
          });
        }
      });
    });

    const topDishes = Object.entries(dishCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const topModifications = Object.entries(modificationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      totalOrders,
      lastOrder,
      frequency,
      topDishes,
      topModifications
    };
  }, [selectedCustomer, customerOrders]);

  // Check for upcoming birthday (within next 7 days)
  const isBirthdayUpcoming = (birthDate?: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const bday = new Date(birthDate);
    bday.setFullYear(today.getFullYear());
    
    if (bday < today) {
      bday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = Math.abs(bday.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-tuplato/10 p-3 rounded-xl">
            <Users className="w-6 h-6 text-tuplato" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lista de Usuarios</h2>
            <p className="text-sm text-gray-500">{customers.length} clientes registrados</p>
          </div>
        </div>
        
        <div className="w-full sm:w-72 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tuplato focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedCustomer(customer)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-tuplato/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tuplato to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {customer.name.charAt(0).toUpperCase()}
                    {customer.lastName ? customer.lastName.charAt(0).toUpperCase() : ''}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-tuplato transition-colors">
                      {customer.name} {customer.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]" title={customer.email}>
                      {customer.email || customer.username}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {customer.phone || 'Sin teléfono'}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5" />
                    {customer.xp || 0} XP
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-tuplato/10 text-tuplato rounded-lg text-xs font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    {customer.points || 0} Pts
                  </div>
                </div>
                {isVIP(customer.xp) && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg text-xs font-bold w-full">
                    <Crown className="w-3.5 h-3.5" />
                    CLIENTE VIP - NIVEL {getCustomerLevel(customer.xp)}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No se encontraron clientes</p>
            <p>Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="relative h-20 bg-gradient-to-r from-tuplato to-emerald-600">
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="px-6 sm:px-8 pb-8 pt-6 flex-1 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedCustomer.name} {selectedCustomer.lastName}
                  </h2>
                  <p className="text-gray-500 font-medium flex items-center gap-2 mt-1.5">
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="truncate">ID: {selectedCustomer.documentId || 'No registrado'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Información de Contacto</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Correo Electrónico</p>
                            <p className="font-medium text-gray-900">{selectedCustomer.email || selectedCustomer.username}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="font-medium text-gray-900">{selectedCustomer.phone || 'No registrado'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Dirección</p>
                            <p className="font-medium text-gray-900">{selectedCustomer.address || 'No registrada'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Detalles de Cuenta</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                            <p className="font-medium text-gray-900">{formatDate(selectedCustomer.birthDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Miembro desde</p>
                            <p className="font-medium text-gray-900">{formatDate(selectedCustomer.registeredAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rewards Summary */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">Resumen de Recompensas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 text-yellow-600 mb-1">
                            <Star className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Experiencia</span>
                          </div>
                          <p className="text-2xl font-black text-gray-900">{selectedCustomer.xp || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 text-tuplato mb-1">
                            <Trophy className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Puntos</span>
                          </div>
                          <p className="text-2xl font-black text-gray-900">{selectedCustomer.points || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIP Dashboard */}
                {isVIP(selectedCustomer.xp) && vipStats && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl text-white shadow-md">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">Panel VIP</h3>
                        <p className="text-sm text-gray-500 font-medium">Nivel {getCustomerLevel(selectedCustomer.xp)} Alcanzado</p>
                      </div>
                    </div>

                    {isBirthdayUpcoming(selectedCustomer.birthDate) && (
                      <div className="mb-6 bg-gradient-to-r from-tuplato/10 to-emerald-500/10 border border-tuplato/20 rounded-2xl p-4 flex items-start gap-4">
                        <div className="bg-white p-2 rounded-full shadow-sm text-tuplato shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">¡Cumpleaños a la vista! 🎉</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            El cumpleaños de {selectedCustomer.name} es en los próximos 7 días. ¡Envíale un mensaje con un regalo especial para fidelizarlo!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{vipStats.totalOrders}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Frecuencia</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{vipStats.frequency}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          Platos Favoritos
                        </h4>
                        <div className="space-y-2">
                          {vipStats.topDishes.length > 0 ? (
                            vipStats.topDishes.map((dish, i) => (
                              <div key={i} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                <span className="font-medium text-gray-900 text-sm">{dish.name}</span>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{dish.count} veces</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No hay suficientes datos</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          Modificaciones Frecuentes
                        </h4>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                          <ul className="space-y-2">
                            {vipStats.topModifications.length > 0 ? (
                              vipStats.topModifications.map((mod, i) => (
                                <li key={i} className="flex items-start justify-between gap-2 text-sm text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span className="capitalize">{mod.name}</span>
                                  </div>
                                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">{mod.count}x</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-500 italic">No hay modificaciones registradas</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
