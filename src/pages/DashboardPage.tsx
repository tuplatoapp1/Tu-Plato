import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Crown, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShoppingBag,
  Clock,
  Heart,
  AlertTriangle,
  Gift
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'vip'>('general');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Load data from localStorage
  const orders = useMemo(() => JSON.parse(localStorage.getItem('customer_orders') || '[]'), []);
  const customers = useMemo(() => JSON.parse(localStorage.getItem('registered_customers') || '[]'), []);
  const menuItems = useMemo(() => JSON.parse(localStorage.getItem('inventory_menu') || '[]'), []);
  const zones = useMemo(() => JSON.parse(localStorage.getItem('inventory_zones') || '[]'), []);

  // --- GENERAL STATS ---
  const generalStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Dishes performance
    const dishCounts: Record<string, { count: number, revenue: number }> = {};
    const extraCounts: Record<string, number> = {};
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (!dishCounts[item.name]) {
          dishCounts[item.name] = { count: 0, revenue: 0 };
        }
        dishCounts[item.name].count += item.quantity;
        dishCounts[item.name].revenue += (item.price * item.quantity);

        // Calculate extras from notes (mocking extra revenue)
        if (item.notes) {
          const notes = item.notes.split(',').map((n: string) => n.trim().toLowerCase()).filter((n: string) => n.length > 0);
          notes.forEach((note: string) => {
            if (note.includes('extra') || note.includes('adicional')) {
              extraCounts[note] = (extraCounts[note] || 0) + 1;
            }
          });
        }
      });
    });

    const sortedDishes = Object.entries(dishCounts).sort((a, b) => b[1].count - a[1].count);
    const topDishes = sortedDishes.slice(0, 5).map(([name, data]) => ({ name, ...data }));
    const bottomDishes = sortedDishes.slice(-3).reverse().map(([name, data]) => ({ name, ...data }));

    const totalExtrasRevenue = Object.values(extraCounts).reduce((sum, count) => sum + (count * 1.5), 0); // Assuming $1.5 per extra

    // Zones performance
    const zoneStats: Record<string, { orders: number, revenue: number }> = {};
    orders.forEach((order: any) => {
      if (order.zoneId) {
        const zone = zones.find((z: any) => z.id === order.zoneId);
        const zoneName = zone ? zone.name : 'Desconocida';
        if (!zoneStats[zoneName]) zoneStats[zoneName] = { orders: 0, revenue: 0 };
        zoneStats[zoneName].orders += 1;
        zoneStats[zoneName].revenue += order.total;
      }
    });
    const topZones = Object.entries(zoneStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.orders - a.orders);

    // Revenue by day (mocking last 7 days from available orders)
    const revenueByDay: Record<string, number> = {};
    orders.forEach((order: any) => {
      const date = new Date(order.date).toLocaleDateString('es-ES', { weekday: 'short' });
      revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
    });
    const revenueChartData = Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue }));

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      topDishes,
      bottomDishes,
      topZones,
      totalExtrasRevenue,
      revenueChartData
    };
  }, [orders, zones]);

  // --- VIP STATS ---
  const vipStats = useMemo(() => {
    const customerStats: Record<string, { orders: number, spent: number, lastOrder: Date, name: string, xp: number }> = {};
    
    orders.forEach((order: any) => {
      if (!customerStats[order.userId]) {
        const customer = customers.find((c: any) => c.username === order.userId);
        customerStats[order.userId] = { 
          orders: 0, 
          spent: 0, 
          lastOrder: new Date(order.date),
          name: customer ? customer.name : order.customerName,
          xp: customer ? customer.xp : 0
        };
      }
      customerStats[order.userId].orders += 1;
      customerStats[order.userId].spent += order.total;
      const orderDate = new Date(order.date);
      if (orderDate > customerStats[order.userId].lastOrder) {
        customerStats[order.userId].lastOrder = orderDate;
      }
    });

    const allCustomers = Object.entries(customerStats).map(([id, data]) => ({ id, ...data }));
    
    // Top 10 VIPs
    const topVIPs = [...allCustomers]
      .filter(c => c.xp >= 1000) // Assuming 1000 XP is VIP threshold
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);

    // Oldest but active (more than 3 orders, last order within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldestActive = [...allCustomers]
      .filter(c => c.orders >= 3 && c.lastOrder >= thirtyDaysAgo)
      .sort((a, b) => b.orders - a.orders) // Proxy for oldest/most loyal
      .slice(0, 3);

    // At risk VIPs (VIPs who haven't ordered in 21 days)
    const twentyOneDaysAgo = new Date();
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
    const atRiskVIPs = [...allCustomers]
      .filter(c => c.xp >= 1000 && c.lastOrder < twentyOneDaysAgo);

    // Upcoming birthdays
    const currentMonth = new Date().getMonth();
    const upcomingBirthdays = customers.filter((c: any) => {
      if (!c.birthDate || c.xp < 1000) return false;
      const bMonth = new Date(c.birthDate).getMonth();
      return bMonth === currentMonth;
    });

    // Retention vs New
    const retentionData = [
      { name: 'Recurrentes', value: allCustomers.filter(c => c.orders > 1).length },
      { name: 'Nuevos', value: allCustomers.filter(c => c.orders === 1).length }
    ];

    return {
      topVIPs,
      oldestActive,
      atRiskVIPs,
      upcomingBirthdays,
      retentionData
    };
  }, [orders, customers]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Panel de Control</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analíticas y rendimiento de tu restaurante</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'general' 
                ? 'bg-white dark:bg-gray-700 text-tuplato shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Rendimiento General
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'vip' 
                ? 'bg-white dark:bg-gray-700 text-yellow-500 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Crown className="w-4 h-4" />
            Inteligencia VIP
          </button>
        </div>
      </div>

      {activeTab === 'general' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">${generalStats.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-500 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12.5% vs mes anterior</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pedidos</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{generalStats.totalOrders}</h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-500 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+5.2% vs mes anterior</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Promedio</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">${generalStats.avgTicket.toFixed(2)}</h3>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500 font-medium">
                <span>Estable</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos por Extras</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">${generalStats.totalExtrasRevenue.toFixed(2)}</h3>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500 font-medium">
                <span>Generado por modificaciones</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Ingresos Recientes</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generalStats.revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Zones */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-tuplato" />
                Zonas con Más Ventas
              </h3>
              <div className="space-y-4">
                {generalStats.topZones.length > 0 ? generalStats.topZones.slice(0, 5).map((zone, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-tuplato/10 text-tuplato flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{zone.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 dark:text-white">{zone.orders} pedidos</p>
                      <p className="text-sm text-gray-500">${zone.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No hay suficientes datos de zonas</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Dishes */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Platos Más Vendidos
              </h3>
              <div className="space-y-4">
                {generalStats.topDishes.length > 0 ? generalStats.topDishes.map((dish, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-bold w-4">{i + 1}.</span>
                      <span className="font-medium text-gray-900 dark:text-white">{dish.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{dish.count} uds</span>
                      <span className="font-bold text-green-600 w-20 text-right">${dish.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No hay suficientes datos de pedidos</p>
                )}
              </div>
            </div>

            {/* Bottom Dishes */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                Platos Menos Vendidos (Atención)
              </h3>
              <div className="space-y-4">
                {generalStats.bottomDishes.length > 0 ? generalStats.bottomDishes.map((dish, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <span className="font-medium text-gray-900 dark:text-white">{dish.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-red-500 font-medium">Solo {dish.count} uds</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No hay suficientes datos de pedidos</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'vip' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* VIP Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <Crown className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20" />
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <Gift className="w-6 h-6" />
                Cumpleañeros VIP del Mes
              </h3>
              <p className="text-yellow-100 mb-4">Sorprende a tus mejores clientes en su día especial.</p>
              
              <div className="space-y-2 relative z-10">
                {vipStats.upcomingBirthdays.length > 0 ? vipStats.upcomingBirthdays.map((c: any, i: number) => (
                  <div key={i} className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex justify-between items-center">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-sm bg-white text-yellow-600 px-2 py-1 rounded-md font-bold">
                      {new Date(c.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )) : (
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <p>No hay cumpleaños VIP este mes</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                VIPs en Riesgo de Fuga
              </h3>
              <p className="text-sm text-gray-500 mb-4">Clientes VIP que no han pedido en más de 21 días.</p>
              
              <div className="space-y-3">
                {vipStats.atRiskVIPs.length > 0 ? vipStats.atRiskVIPs.slice(0, 4).map((c, i) => {
                  const daysSince = Math.floor((new Date().getTime() - c.lastOrder.getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={i} className="flex items-center justify-between p-3 border border-orange-100 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-900/30 rounded-xl">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-gray-500">Último pedido hace {daysSince} días</p>
                      </div>
                      <button className="text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
                        Recuperar
                      </button>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 text-center py-4">¡Excelente! Todos tus VIPs están activos.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 10 VIPs */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Top 10 Clientes VIP
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Rango</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3 text-center">Pedidos</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Total Gastado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vipStats.topVIPs.length > 0 ? vipStats.topVIPs.map((c, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                        <td className="px-4 py-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            i === 0 ? 'bg-yellow-100 text-yellow-600' :
                            i === 1 ? 'bg-gray-100 text-gray-600' :
                            i === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            #{i + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{c.name}</td>
                        <td className="px-4 py-3 text-center font-medium">{c.orders}</td>
                        <td className="px-4 py-3 text-right font-black text-tuplato">${c.spent.toFixed(2)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Aún no hay suficientes datos para el ranking VIP
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side Stats */}
            <div className="space-y-6">
              {/* Retention Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Retención vs Nuevos</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vipStats.retentionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vipStats.retentionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {vipStats.retentionData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-600 dark:text-gray-300">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oldest Active */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Más Antiguos y Activos
                </h3>
                <div className="space-y-3">
                  {vipStats.oldestActive.length > 0 ? vipStats.oldestActive.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{c.name}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                        {c.orders} pedidos
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-500 text-center">No hay datos suficientes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
