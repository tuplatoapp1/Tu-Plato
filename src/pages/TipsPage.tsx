import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Coins, DollarSign, CreditCard, Smartphone, Wallet, Calculator, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { useTips } from '../context/TipsContext';
import { useAuth } from '../context/AuthContext';
import { TipCurrency, TipMethod } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';

export default function TipsPage() {
  const { user } = useAuth();
  const { tips, exchangeRate, setExchangeRate, addTip, deleteTip, liquidateTips } = useTips();
  const [activeTab, setActiveTab] = useState<'REGISTRO' | 'ADMIN'>('REGISTRO');

  // Form state
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<TipCurrency>('USD');
  const [method, setMethod] = useState<TipMethod>('EFECTIVO');
  const [reference, setReference] = useState('');

  // Calculator state
  const [employeesCount, setEmployeesCount] = useState(1);

  const pendingTips = tips.filter(t => t.status === 'PENDIENTE');
  const myPendingTips = pendingTips.filter(t => t.user === user?.username);

  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    addTip(numAmount, currency, method, reference);
    setAmount('');
    setReference('');
  };

  const handleLiquidateAll = () => {
    if (confirm(`¿Estás seguro de liquidar ${pendingTips.length} propinas?`)) {
      liquidateTips(pendingTips.map(t => t.id));
    }
  };

  // Totals calculation
  const totals = pendingTips.reduce((acc, tip) => {
    if (tip.currency === 'USD') {
      acc.usd += tip.amount;
      if (tip.method === 'EFECTIVO') acc.usdEfectivo += tip.amount;
      if (tip.method === 'ZELLE') acc.usdZelle += tip.amount;
    } else {
      acc.bs += tip.amount;
      if (tip.method === 'EFECTIVO') acc.bsEfectivo += tip.amount;
      if (tip.method === 'PAGO_MOVIL') acc.bsPagoMovil += tip.amount;
      if (tip.method === 'PUNTO_VENTA') acc.bsPunto += tip.amount;
    }
    return acc;
  }, { usd: 0, bs: 0, usdEfectivo: 0, usdZelle: 0, bsEfectivo: 0, bsPagoMovil: 0, bsPunto: 0 });

  const totalUsdEquivalent = totals.usd + (totals.bs / exchangeRate);
  const perEmployee = employeesCount > 0 ? totalUsdEquivalent / employeesCount : 0;

  const getMethodIcon = (m: TipMethod) => {
    switch(m) {
      case 'EFECTIVO': return <Wallet className="w-4 h-4" />;
      case 'PAGO_MOVIL': return <Smartphone className="w-4 h-4" />;
      case 'PUNTO_VENTA': return <CreditCard className="w-4 h-4" />;
      case 'ZELLE': return <DollarSign className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Propinas</h1>
          <p className="text-gray-500">Gestión y control del bote de propinas</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex relative w-full sm:w-auto">
          <div className="absolute inset-0 rounded-2xl pointer-events-none border border-gray-100/50" />
          <button
            onClick={() => setActiveTab('REGISTRO')}
            className={`relative flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 z-10 ${
              activeTab === 'REGISTRO' ? 'text-tuplato shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {activeTab === 'REGISTRO' && (
              <motion.div layoutId="tipsTabBg" className="absolute inset-0 bg-tuplato/10 rounded-xl -z-10" />
            )}
            Registro Rápido
          </button>
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`relative flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 z-10 ${
              activeTab === 'ADMIN' ? 'text-tuplato shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {activeTab === 'ADMIN' && (
              <motion.div layoutId="tipsTabBg" className="absolute inset-0 bg-tuplato/10 rounded-xl -z-10" />
            )}
            Administración
          </button>
        </div>
      </div>

      {activeTab === 'REGISTRO' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-gray-200 rounded-2xl overflow-hidden sticky top-6">
              <div className="bg-gray-50/80 border-b border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-tuplato" />
                  Nueva Propina
                </h2>
              </div>
              <CardContent className="p-5">
                <form onSubmit={handleAddTip} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input 
                        label="Monto" 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-2xl font-bold h-14 text-center"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Moneda</label>
                      <select 
                        value={currency}
                        onChange={e => setCurrency(e.target.value as TipCurrency)}
                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 font-bold text-gray-700 focus:ring-2 focus:ring-tuplato focus:border-transparent transition-all"
                      >
                        <option value="USD">Dólares ($)</option>
                        <option value="BS">Bolívares (Bs)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Método</label>
                      <select 
                        value={method}
                        onChange={e => setMethod(e.target.value as TipMethod)}
                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 font-bold text-gray-700 focus:ring-2 focus:ring-tuplato focus:border-transparent transition-all"
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        {currency === 'BS' && <option value="PAGO_MOVIL">Pago Móvil</option>}
                        {currency === 'BS' && <option value="PUNTO_VENTA">Punto de Venta</option>}
                        {currency === 'USD' && <option value="ZELLE">Zelle</option>}
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                  </div>

                  <Input 
                    label="Referencia / Nota (Opcional)" 
                    placeholder="Ej. Mesa 4, Ref: 1234"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                  />

                  <Button type="submit" className="w-full h-12 text-base shadow-md">
                    Registrar Propina
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* My Recent Tips */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Mis Registros Pendientes</h3>
            {myPendingTips.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-900">No hay propinas pendientes</p>
                <p className="text-sm text-gray-500 mt-1">Las propinas que registres aparecerán aquí hasta que sean liquidadas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myPendingTips.map(tip => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={tip.id} 
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tip.currency === 'USD' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {getMethodIcon(tip.method)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg leading-none mb-1">
                          {tip.currency === 'USD' ? '$' : 'Bs'} {tip.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {format(new Date(tip.date), "HH:mm", { locale: es })} • {tip.method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteTip(tip.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admin Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-gray-200 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/20">
              <CardContent className="p-5">
                <p className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">Total Dólares</p>
                <h3 className="text-3xl font-black text-green-600 mb-4">${totals.usd.toFixed(2)}</h3>
                <div className="space-y-2 text-sm font-medium text-green-700/80">
                  <div className="flex justify-between"><span>Efectivo:</span> <span>${totals.usdEfectivo.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Zelle:</span> <span>${totals.usdZelle.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/20">
              <CardContent className="p-5">
                <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Total Bolívares</p>
                <h3 className="text-3xl font-black text-blue-600 mb-4">Bs {totals.bs.toFixed(2)}</h3>
                <div className="space-y-2 text-sm font-medium text-blue-700/80">
                  <div className="flex justify-between"><span>Efectivo:</span> <span>Bs {totals.bsEfectivo.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Pago Móvil:</span> <span>Bs {totals.bsPagoMovil.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Punto:</span> <span>Bs {totals.bsPunto.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200 rounded-2xl bg-gray-900 text-white">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Equivalente</p>
                  <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-lg">
                    <span className="text-xs text-gray-400">Tasa:</span>
                    <input 
                      type="number" 
                      value={exchangeRate}
                      onChange={e => setExchangeRate(parseFloat(e.target.value) || 1)}
                      className="w-16 bg-transparent text-white font-mono text-xs outline-none text-right"
                      step="0.01"
                    />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white mt-auto">${totalUsdEquivalent.toFixed(2)}</h3>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calculator */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="bg-gray-50/80 border-b border-gray-100 p-5">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-tuplato" />
                    Calculadora de Reparto
                  </h2>
                </div>
                <CardContent className="p-5 space-y-5">
                  <Input 
                    label="Número de Empleados" 
                    type="number" 
                    min="1"
                    value={employeesCount}
                    onChange={e => setEmployeesCount(parseInt(e.target.value) || 1)}
                    className="text-center font-bold text-xl h-12"
                  />
                  
                  <div className="bg-tuplato/5 border border-tuplato/20 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-tuplato uppercase tracking-wider mb-1">Monto por Empleado</p>
                    <p className="text-3xl font-black text-tuplato">${perEmployee.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Equivalente a Bs {(perEmployee * exchangeRate).toFixed(2)}</p>
                  </div>

                  <Button 
                    onClick={handleLiquidateAll}
                    disabled={pendingTips.length === 0}
                    className="w-full h-12 bg-gray-900 text-white hover:bg-black"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Liquidar Semana ({pendingTips.length})
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pending List Admin */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Desglose de Propinas Pendientes</h2>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {pendingTips.length} registros
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold">Fecha</th>
                        <th className="px-6 py-4 font-bold">Usuario</th>
                        <th className="px-6 py-4 font-bold">Monto</th>
                        <th className="px-6 py-4 font-bold">Método</th>
                        <th className="px-6 py-4 font-bold">Referencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingTips.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No hay propinas pendientes por liquidar.
                          </td>
                        </tr>
                      ) : (
                        pendingTips.map(tip => (
                          <tr key={tip.id} className="bg-white hover:bg-gray-50/50">
                            <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                              {format(new Date(tip.date), "d MMM, HH:mm", { locale: es })}
                            </td>
                            <td className="px-6 py-3 font-medium text-gray-900">
                              {tip.user}
                            </td>
                            <td className="px-6 py-3 font-bold">
                              <span className={tip.currency === 'USD' ? 'text-green-600' : 'text-blue-600'}>
                                {tip.currency === 'USD' ? '$' : 'Bs'} {tip.amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                {getMethodIcon(tip.method)}
                                {tip.method.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-500 text-xs">
                              {tip.reference || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
