import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tip, TipCurrency, TipMethod } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface TipsContextType {
  tips: Tip[];
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  addTip: (amount: number, currency: TipCurrency, method: TipMethod, reference?: string) => void;
  deleteTip: (id: string) => void;
  liquidateTips: (tipIds: string[]) => void;
}

const TipsContext = createContext<TipsContextType | undefined>(undefined);

export function TipsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [tips, setTips] = useState<Tip[]>(() => {
    const saved = localStorage.getItem('tuplato_tips');
    return saved ? JSON.parse(saved) : [];
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('tuplato_exchange_rate');
    return saved ? parseFloat(saved) : 40.5; // Default fallback
  });

  useEffect(() => {
    localStorage.setItem('tuplato_tips', JSON.stringify(tips));
  }, [tips]);

  useEffect(() => {
    localStorage.setItem('tuplato_exchange_rate', exchangeRate.toString());
  }, [exchangeRate]);

  const addTip = (amount: number, currency: TipCurrency, method: TipMethod, reference?: string) => {
    const newTip: Tip = {
      id: crypto.randomUUID(),
      amount,
      currency,
      method,
      reference,
      date: new Date().toISOString(),
      user: user?.username || 'Desconocido',
      status: 'PENDIENTE'
    };
    setTips(prev => [newTip, ...prev]);
    toast.success(`Propina de ${amount} ${currency} registrada`);
  };

  const deleteTip = (id: string) => {
    setTips(prev => prev.filter(t => t.id !== id));
    toast.success('Propina eliminada');
  };

  const liquidateTips = (tipIds: string[]) => {
    setTips(prev => prev.map(t => 
      tipIds.includes(t.id) ? { ...t, status: 'LIQUIDADA' } : t
    ));
    toast.success(`${tipIds.length} propinas marcadas como liquidadas`);
  };

  return (
    <TipsContext.Provider value={{ tips, exchangeRate, setExchangeRate, addTip, deleteTip, liquidateTips }}>
      {children}
    </TipsContext.Provider>
  );
}

export function useTips() {
  const context = useContext(TipsContext);
  if (context === undefined) {
    throw new Error('useTips must be used within a TipsProvider');
  }
  return context;
}
