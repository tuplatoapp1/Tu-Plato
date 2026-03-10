import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Prize {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
}

export interface RewardsConfig {
  xpPerDollar: number;
  xpLevels: number[]; // Array of 10 numbers for XP required per level
  prizes: Prize[];
}

interface RewardsContextType {
  config: RewardsConfig;
  updateConfig: (newConfig: Partial<RewardsConfig>) => void;
  addPrize: (prize: Omit<Prize, 'id'>) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  removePrize: (id: string) => void;
}

const DEFAULT_CONFIG: RewardsConfig = {
  xpPerDollar: 1,
  xpLevels: [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000],
  prizes: [
    { id: '1', name: 'Hamburguesa Clásica Gratis', description: 'Canjeable en tu próximo pedido', pointsRequired: 500 },
    { id: '2', name: '15% de Descuento', description: 'Válido para toda la cuenta', pointsRequired: 1000 }
  ]
};

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<RewardsConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const storedConfig = localStorage.getItem('rewards_config');
    if (storedConfig) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) });
      } catch (e) {
        console.error("Failed to parse stored rewards config", e);
      }
    }
  }, []);

  const saveConfig = (newConfig: RewardsConfig) => {
    setConfig(newConfig);
    localStorage.setItem('rewards_config', JSON.stringify(newConfig));
  };

  const updateConfig = (updates: Partial<RewardsConfig>) => {
    saveConfig({ ...config, ...updates });
  };

  const addPrize = (prize: Omit<Prize, 'id'>) => {
    const newPrize = { ...prize, id: Date.now().toString() };
    saveConfig({ ...config, prizes: [...config.prizes, newPrize] });
  };

  const updatePrize = (id: string, prizeUpdates: Partial<Prize>) => {
    saveConfig({
      ...config,
      prizes: config.prizes.map(p => p.id === id ? { ...p, ...prizeUpdates } : p)
    });
  };

  const removePrize = (id: string) => {
    saveConfig({
      ...config,
      prizes: config.prizes.filter(p => p.id !== id)
    });
  };

  return (
    <RewardsContext.Provider value={{ config, updateConfig, addPrize, updatePrize, removePrize }}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}
