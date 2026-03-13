import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';
import { MenuItem, MENU_ITEMS } from '../data/menu';

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  overlayEnabled?: boolean;
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
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  schedule: ScheduleItem[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Tag {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  questions: SurveyQuestion[];
  rewardXP?: number;
  targetType: 'all' | 'level' | 'specific';
  targetValue?: any;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  xpRequired: number;
  icon: string;
  image?: string;
}

export interface XPConfig {
  xpPerDollar: number;
  pointsPerDollar: number;
  xpLevels: number[];
  customMascots?: Record<number, string>;
  customVideos?: Record<number, string>;
}

interface PublicMenuContextType {
  branding: Branding;
  offers: Offer[];
  menuItems: MenuItem[];
  categories: Category[];
  tags: Tag[];
  deliveryZones: DeliveryZone[];
  surveys: Survey[];
  rewards: Reward[];
  xpConfig: XPConfig;
  exchangeRate: number;
  users: any[];
  isLoading: boolean;
  updateBranding: (branding: Partial<Branding>) => Promise<boolean>;
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<boolean>;
  removeOffer: (id: string) => Promise<boolean>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<boolean>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<boolean>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<boolean>;
  removeMenuItem: (id: string) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  removeCategory: (id: string) => Promise<boolean>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<boolean>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<boolean>;
  removeTag: (id: string) => Promise<boolean>;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id'>) => Promise<boolean>;
  updateDeliveryZone: (id: string, zone: Partial<DeliveryZone>) => Promise<boolean>;
  removeDeliveryZone: (id: string) => Promise<boolean>;
  addSurvey: (survey: Omit<Survey, 'id'>) => Promise<boolean>;
  updateSurvey: (id: string, survey: Partial<Survey>) => Promise<boolean>;
  removeSurvey: (id: string) => Promise<boolean>;
  addReward: (reward: Omit<Reward, 'id'>) => Promise<boolean>;
  updateReward: (id: string, reward: Partial<Reward>) => Promise<boolean>;
  removeReward: (id: string) => Promise<boolean>;
  updateXPConfig: (config: Partial<XPConfig>) => Promise<boolean>;
  updateExchangeRate: (rate: number) => Promise<boolean>;
  updateUser: (id: string, user: any) => Promise<boolean>;
  addUser: (user: any) => Promise<boolean>;
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
  whatsappNumber: '',
  whatsappMessageTemplate: '*Nuevo Pedido - {restaurantName}*\n\n*Cliente:* {customerName}\n*Teléfono:* {customerPhone}\n\n*Dirección:* {address}\n\n*Pedido:*\n{orderItems}\n\n*Total:* ${totalPrice}',
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

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'entradas', label: 'Entradas', icon: 'Pizza' },
  { id: 'principales', label: 'Principales', icon: 'ChefHat' },
  { id: 'postres', label: 'Postres', icon: 'IceCream' },
  { id: 'bebidas', label: 'Bebidas', icon: 'Wine' },
];

const DEFAULT_TAGS: Tag[] = [
  { id: 'spicy', label: 'Picante', icon: 'Flame', color: 'red' },
  { id: 'vegan', label: 'Vegano', icon: 'Leaf', color: 'green' },
  { id: 'popular', label: 'Popular', icon: 'Star', color: 'yellow' },
  { id: 'new', label: 'Nuevo', icon: 'Sparkles', color: 'blue' },
];

const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  { id: '1', name: 'San Carlos', price: 2.00 },
  { id: '2', name: 'Los Samanes', price: 3.00 },
  { id: '3', name: 'Centro', price: 1.50 },
];

const DEFAULT_REWARDS: Reward[] = [
  {
    id: '1',
    title: 'Hamburguesa Gratis',
    description: 'Canjeable por 500 XP',
    xpRequired: 500,
    icon: 'Gift'
  },
  {
    id: '2',
    title: 'Bebida Grande Gratis',
    description: 'Canjeable por 200 XP',
    xpRequired: 200,
    icon: 'Trophy'
  }
];

const DEFAULT_XP_CONFIG: XPConfig = {
  xpPerDollar: 10,
  pointsPerDollar: 10,
  xpLevels: [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000]
};

const PublicMenuContext = createContext<PublicMenuContextType | undefined>(undefined);

// Channel for cross-tab/component communication
const MENU_CHANNEL = new BroadcastChannel('public_menu_updates');

export function PublicMenuProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(DEFAULT_DELIVERY_ZONES);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [xpConfig, setXpConfig] = useState<XPConfig>(DEFAULT_XP_CONFIG);
  const [exchangeRate, setExchangeRate] = useState<number>(36.0); // Default rate
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const storedBranding = await db.get<Branding>('public_menu_branding');
      const storedOffers = await db.get<Offer[]>('public_menu_offers');
      const storedMenuItems = await db.get<MenuItem[]>('public_menu_items');
      const storedCategories = await db.get<Category[]>('public_menu_categories');
      const storedTags = await db.get<Tag[]>('public_menu_tags');
      const storedZones = await db.get<DeliveryZone[]>('public_menu_zones');
      const storedSurveys = await db.get<Survey[]>('public_menu_surveys');
      const storedRewards = await db.get<Reward[]>('public_menu_rewards');
      const storedXPConfig = await db.get<XPConfig>('public_menu_xp_config');
      const storedExchangeRate = await db.get<number>('public_menu_exchange_rate');

      if (storedBranding) {
        setBranding(prev => ({ ...DEFAULT_BRANDING, ...storedBranding }));
      }
      if (storedOffers) {
        setOffers(storedOffers);
      }
      if (storedMenuItems) {
        setMenuItems(storedMenuItems);
      }
      if (storedCategories) {
        setCategories(storedCategories);
      }
      if (storedTags) {
        setTags(storedTags);
      }
      if (storedZones) {
        setDeliveryZones(storedZones);
      }
      if (storedSurveys) {
        setSurveys(storedSurveys);
      }
      if (storedRewards) {
        setRewards(storedRewards);
      }
      if (storedXPConfig) {
        setXpConfig(storedXPConfig);
      }
      if (storedExchangeRate) {
        setExchangeRate(storedExchangeRate);
      }

      // Load users from localStorage (mocking a DB for now)
      let storedUsers = JSON.parse(localStorage.getItem('registered_customers') || '[]');
      
      if (storedUsers.length === 0) {
        storedUsers = [
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
            xp: 3400,
            registeredAt: '2025-11-20T10:00:00Z',
            address: 'Av. Principal 123, Ciudad',
            role: 'customer'
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
            xp: 1200,
            registeredAt: '2026-01-15T14:30:00Z',
            address: 'Calle Secundaria 456, Barrio Sur',
            role: 'customer'
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
            xp: 8500,
            registeredAt: '2025-08-05T09:15:00Z',
            address: 'Plaza Central 789, Depto 4B',
            role: 'customer'
          },
          {
            id: '4',
            username: 'pedroadmin@email.com',
            name: 'Pedroadmin',
            lastName: 'Prueba',
            documentId: '1122334455',
            phone: '+1 555 123 4567',
            email: 'pedroadmin@email.com',
            birthDate: '1985-01-01',
            points: 10000,
            xp: 2500,
            registeredAt: '2026-02-01T10:00:00Z',
            address: 'Calle de Prueba 123',
            role: 'customer'
          }
        ];
        localStorage.setItem('registered_customers', JSON.stringify(storedUsers));
      }
      setUsers(storedUsers);
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

  const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<boolean> => {
    try {
      const newItem = { ...item, id: crypto.randomUUID() };
      const newItems = [...menuItems, newItem];
      await db.set('public_menu_items', newItems);
      setMenuItems(newItems);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding menu item:', error);
      return false;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<boolean> => {
    try {
      const newItems = menuItems.map(item => item.id === id ? { ...item, ...updates } : item);
      await db.set('public_menu_items', newItems);
      setMenuItems(newItems);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating menu item:', error);
      return false;
    }
  };

  const removeMenuItem = async (id: string): Promise<boolean> => {
    try {
      const newItems = menuItems.filter(item => item.id !== id);
      await db.set('public_menu_items', newItems);
      setMenuItems(newItems);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing menu item:', error);
      return false;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>): Promise<boolean> => {
    try {
      const newCategory = { ...category, id: crypto.randomUUID() };
      const newCategories = [...categories, newCategory];
      await db.set('public_menu_categories', newCategories);
      setCategories(newCategories);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
    try {
      const newCategories = categories.map(c => c.id === id ? { ...c, ...updates } : c);
      await db.set('public_menu_categories', newCategories);
      setCategories(newCategories);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  };

  const removeCategory = async (id: string): Promise<boolean> => {
    try {
      const newCategories = categories.filter(c => c.id !== id);
      await db.set('public_menu_categories', newCategories);
      setCategories(newCategories);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing category:', error);
      return false;
    }
  };

  const addTag = async (tag: Omit<Tag, 'id'>): Promise<boolean> => {
    try {
      const newTag = { ...tag, id: crypto.randomUUID() };
      const newTags = [...tags, newTag];
      await db.set('public_menu_tags', newTags);
      setTags(newTags);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding tag:', error);
      return false;
    }
  };

  const updateTag = async (id: string, updates: Partial<Tag>): Promise<boolean> => {
    try {
      const newTags = tags.map(t => t.id === id ? { ...t, ...updates } : t);
      await db.set('public_menu_tags', newTags);
      setTags(newTags);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      return false;
    }
  };

  const removeTag = async (id: string): Promise<boolean> => {
    try {
      const newTags = tags.filter(t => t.id !== id);
      await db.set('public_menu_tags', newTags);
      setTags(newTags);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing tag:', error);
      return false;
    }
  };

  const addDeliveryZone = async (zone: Omit<DeliveryZone, 'id'>): Promise<boolean> => {
    try {
      const newZone = { ...zone, id: crypto.randomUUID() };
      const newZones = [...deliveryZones, newZone];
      await db.set('public_menu_zones', newZones);
      setDeliveryZones(newZones);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding zone:', error);
      return false;
    }
  };

  const updateDeliveryZone = async (id: string, updates: Partial<DeliveryZone>): Promise<boolean> => {
    try {
      const newZones = deliveryZones.map(z => z.id === id ? { ...z, ...updates } : z);
      await db.set('public_menu_zones', newZones);
      setDeliveryZones(newZones);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating zone:', error);
      return false;
    }
  };

  const removeDeliveryZone = async (id: string): Promise<boolean> => {
    try {
      const newZones = deliveryZones.filter(z => z.id !== id);
      await db.set('public_menu_zones', newZones);
      setDeliveryZones(newZones);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing zone:', error);
      return false;
    }
  };

  const addSurvey = async (survey: Omit<Survey, 'id'>): Promise<boolean> => {
    try {
      const newSurvey = { ...survey, id: crypto.randomUUID() };
      const newSurveys = [...surveys, newSurvey];
      await db.set('public_menu_surveys', newSurveys);
      setSurveys(newSurveys);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding survey:', error);
      return false;
    }
  };

  const updateSurvey = async (id: string, updates: Partial<Survey>): Promise<boolean> => {
    try {
      const newSurveys = surveys.map(s => s.id === id ? { ...s, ...updates } : s);
      await db.set('public_menu_surveys', newSurveys);
      setSurveys(newSurveys);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating survey:', error);
      return false;
    }
  };

  const removeSurvey = async (id: string): Promise<boolean> => {
    try {
      const newSurveys = surveys.filter(s => s.id !== id);
      await db.set('public_menu_surveys', newSurveys);
      setSurveys(newSurveys);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing survey:', error);
      return false;
    }
  };

  const addReward = async (reward: Omit<Reward, 'id'>): Promise<boolean> => {
    try {
      const newReward = { ...reward, id: crypto.randomUUID() };
      const newRewards = [...rewards, newReward];
      await db.set('public_menu_rewards', newRewards);
      setRewards(newRewards);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding reward:', error);
      return false;
    }
  };

  const updateReward = async (id: string, updates: Partial<Reward>): Promise<boolean> => {
    try {
      const newRewards = rewards.map(r => r.id === id ? { ...r, ...updates } : r);
      await db.set('public_menu_rewards', newRewards);
      setRewards(newRewards);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating reward:', error);
      return false;
    }
  };

  const removeReward = async (id: string): Promise<boolean> => {
    try {
      const newRewards = rewards.filter(r => r.id !== id);
      await db.set('public_menu_rewards', newRewards);
      setRewards(newRewards);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error removing reward:', error);
      return false;
    }
  };

  const updateXPConfig = async (updates: Partial<XPConfig>): Promise<boolean> => {
    try {
      const newConfig = { ...xpConfig, ...updates };
      await db.set('public_menu_xp_config', newConfig);
      setXpConfig(newConfig);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating XP config:', error);
      return false;
    }
  };

  const updateExchangeRate = async (rate: number): Promise<boolean> => {
    try {
      await db.set('public_menu_exchange_rate', rate);
      setExchangeRate(rate);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      return false;
    }
  };

  const updateUser = async (id: string, updates: any): Promise<boolean> => {
    try {
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, ...updates } : user
      );
      localStorage.setItem('registered_customers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const addUser = async (user: any): Promise<boolean> => {
    try {
      const newUser = { ...user, id: crypto.randomUUID(), xp: 0, points: 0, role: 'customer', registeredAt: new Date().toISOString() };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('registered_customers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      notifyUpdates();
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  };

  const resetConfig = async () => {
    try {
      await db.clear();
      setBranding(DEFAULT_BRANDING);
      setOffers(DEFAULT_OFFERS);
      setMenuItems(MENU_ITEMS);
      setCategories(DEFAULT_CATEGORIES);
      setTags(DEFAULT_TAGS);
      setDeliveryZones(DEFAULT_DELIVERY_ZONES);
      setSurveys([]);
      setRewards(DEFAULT_REWARDS);
      setXpConfig(DEFAULT_XP_CONFIG);
      notifyUpdates();
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  };

  return (
    <PublicMenuContext.Provider value={{ 
      branding, 
      offers, 
      menuItems,
      categories,
      tags,
      deliveryZones,
      surveys,
      rewards,
      xpConfig,
      exchangeRate,
      users,
      isLoading, 
      updateBranding, 
      addOffer, 
      removeOffer, 
      updateOffer,
      addMenuItem,
      updateMenuItem,
      removeMenuItem,
      addCategory,
      updateCategory,
      removeCategory,
      addTag,
      updateTag,
      removeTag,
      addDeliveryZone,
      updateDeliveryZone,
      removeDeliveryZone,
      addSurvey,
      updateSurvey,
      removeSurvey,
      addReward,
      updateReward,
      removeReward,
      updateXPConfig,
      updateExchangeRate,
      updateUser,
      addUser,
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
