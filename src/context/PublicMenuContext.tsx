import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  days: string;
  hours: string;
}

export interface Branding {
  logoType: 'icon' | 'image';
  logoValue: string; // Icon name or Image URL
  restaurantName: string;
  address: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  schedule: ScheduleItem[];
}

interface PublicMenuContextType {
  branding: Branding;
  offers: Offer[];
  isLoading: boolean;
  updateBranding: (branding: Partial<Branding>) => Promise<boolean>;
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<boolean>;
  removeOffer: (id: string) => Promise<boolean>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<boolean>;
  resetConfig: () => Promise<void>;
}

const DEFAULT_OFFERS: Offer[] = [
  {
    id: '1',
    title: "2x1 en Cócteles",
    subtitle: "Todos los jueves de 18:00 a 20:00",
    image: "https://images.unsplash.com/photo-1536935338788-843bb4d77d82?auto=format&fit=crop&w=1920&q=80",
    color: "from-purple-600 to-blue-600"
  },
  {
    id: '2',
    title: "Menú Degustación",
    subtitle: "Experiencia gastronómica completa por $45",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80",
    color: "from-orange-600 to-red-600"
  },
  {
    id: '3',
    title: "Noche de Pastas",
    subtitle: "20% de descuento en platos italianos",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1920&q=80",
    color: "from-green-600 to-emerald-600"
  }
];

const DEFAULT_BRANDING: Branding = {
  logoType: 'icon',
  logoValue: 'ChefHat',
  restaurantName: 'Tu Plato',
  address: 'Av. Principal 123, Ciudad',
  socialLinks: {
    instagram: '',
    facebook: '',
    whatsapp: ''
  },
  schedule: [
    { id: '1', days: 'Lunes - Viernes', hours: '12:00 - 23:00' },
    { id: '2', days: 'Sábados - Domingos', hours: '12:00 - 00:00' }
  ]
};

const PublicMenuContext = createContext<PublicMenuContextType | undefined>(undefined);

// Channel for cross-tab/component communication
const MENU_CHANNEL = new BroadcastChannel('public_menu_updates');

export function PublicMenuProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const storedBranding = await db.get<Branding>('public_menu_branding');
      const storedOffers = await db.get<Offer[]>('public_menu_offers');

      if (storedBranding) {
        setBranding(prev => ({ ...DEFAULT_BRANDING, ...storedBranding }));
      }
      if (storedOffers) {
        setOffers(storedOffers);
      }
    } catch (error) {
      console.error('Failed to load menu data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'update') {
        loadData();
      }
    };

    MENU_CHANNEL.addEventListener('message', handleMessage);
    return () => MENU_CHANNEL.removeEventListener('message', handleMessage);
  }, []);

  const notifyUpdates = () => {
    MENU_CHANNEL.postMessage('update');
  };

  const updateBranding = async (updates: Partial<Branding>): Promise<boolean> => {
    try {
      const newBranding = { ...branding, ...updates };
      await db.set('public_menu_branding', newBranding);
      setBranding(newBranding);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error saving branding:', error);
      return false;
    }
  };

  const addOffer = async (offer: Omit<Offer, 'id'>): Promise<boolean> => {
    try {
      const newOffer = { ...offer, id: crypto.randomUUID() };
      const newOffers = [...offers, newOffer];
      await db.set('public_menu_offers', newOffers);
      setOffers(newOffers);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding offer:', error);
      return false;
    }
  };

  const removeOffer = async (id: string): Promise<boolean> => {
    try {
      const newOffers = offers.filter(o => o.id !== id);
      await db.set('public_menu_offers', newOffers);
      setOffers(newOffers);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing offer:', error);
      return false;
    }
  };

  const updateOffer = async (id: string, updates: Partial<Offer>): Promise<boolean> => {
    try {
      const newOffers = offers.map(o => o.id === id ? { ...o, ...updates } : o);
      await db.set('public_menu_offers', newOffers);
      setOffers(newOffers);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating offer:', error);
      return false;
    }
  };

  const resetConfig = async () => {
    try {
      await db.clear();
      setBranding(DEFAULT_BRANDING);
      setOffers(DEFAULT_OFFERS);
      notifyUpdates();
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  };

  return (
    <PublicMenuContext.Provider value={{ 
      branding, 
      offers, 
      isLoading, 
      updateBranding, 
      addOffer, 
      removeOffer, 
      updateOffer,
      resetConfig
    }}>
      {children}
    </PublicMenuContext.Provider>
  );
}

export function usePublicMenu() {
  const context = useContext(PublicMenuContext);
  if (context === undefined) {
    throw new Error('usePublicMenu must be used within a PublicMenuProvider');
  }
  return context;
}
