import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

export type IconType = 'lucide' | 'custom';

export interface IconConfig {
  type: IconType;
  value: string; // Name of Lucide icon or Data URL
}

export interface UIContextType {
  icons: Record<string, IconConfig>;
  updateIcon: (key: string, type: IconType, value: string) => void;
  getIconComponent: (key: string, defaultIconName: string) => React.ElementType | string;
  appLogo: IconConfig;
  updateAppLogo: (type: IconType, value: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const DEFAULT_ICONS: Record<string, IconConfig> = {
  home: { type: 'lucide', value: 'Home' },
  menu: { type: 'lucide', value: 'BookOpen' },
  inventory: { type: 'lucide', value: 'Package' },
  history: { type: 'lucide', value: 'History' },
  settings: { type: 'lucide', value: 'Settings' },
};

const DEFAULT_LOGO: IconConfig = { type: 'lucide', value: 'ChefHat' };

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [icons, setIcons] = useState<Record<string, IconConfig>>(DEFAULT_ICONS);
  const [appLogo, setAppLogo] = useState<IconConfig>(DEFAULT_LOGO);

  useEffect(() => {
    const storedIcons = localStorage.getItem('ui_icons');
    if (storedIcons) {
      try {
        setIcons({ ...DEFAULT_ICONS, ...JSON.parse(storedIcons) });
      } catch (e) {
        console.error("Failed to parse stored icons", e);
      }
    }
    
    const storedLogo = localStorage.getItem('app_logo');
    if (storedLogo) {
      try {
        setAppLogo(JSON.parse(storedLogo));
      } catch (e) {
        console.error("Failed to parse stored logo", e);
      }
    }
  }, []);

  const updateIcon = (key: string, type: IconType, value: string) => {
    setIcons(prev => {
      const newIcons = { ...prev, [key]: { type, value } };
      localStorage.setItem('ui_icons', JSON.stringify(newIcons));
      return newIcons;
    });
  };

  const updateAppLogo = (type: IconType, value: string) => {
    const newLogo = { type, value };
    setAppLogo(newLogo);
    localStorage.setItem('app_logo', JSON.stringify(newLogo));
  };

  const getIconComponent = (key: string, defaultIconName: string) => {
    const config = icons[key];
    
    if (!config) {
      // Fallback to default Lucide icon
      // @ts-ignore
      return LucideIcons[defaultIconName] || LucideIcons.HelpCircle;
    }

    if (config.type === 'custom') {
      // Return an image component wrapper or just the string URL to be handled by the consumer
      // But the consumer expects a component usually.
      // Let's return a special component that renders the image
      return ({ className }: { className?: string }) => (
        <img src={config.value} alt={key} className={`object-contain ${className}`} />
      );
    }

    // Lucide icon
    // @ts-ignore
    const Icon = LucideIcons[config.value];
    return Icon || LucideIcons[defaultIconName] || LucideIcons.HelpCircle;
  };

  return (
    <UIContext.Provider value={{ icons, updateIcon, getIconComponent, appLogo, updateAppLogo }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
