import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';
import { MenuItem, MENU_ITEMS } from '../data/menu';

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

interface PublicMenuContextType {
  branding: Branding;
  offers: Offer[];
  menuItems: MenuItem[];
  categories: Category[];
  tags: Tag[];
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
  whatsappMessageTemplate: '*Nuevo Pedido - {restaurantName}*\n\n*Cliente:* {customerName}\n*Teléfono:* {customerPhone}\n\n*Pedido:*\n{orderItems}\n\n*Total:* ${totalPrice}',
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

const PublicMenuContext = createContext<PublicMenuContextType | undefined>(undefined);

// Channel for cross-tab/component communication
const MENU_CHANNEL = new BroadcastChannel('public_menu_updates');

export function PublicMenuProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const storedBranding = await db.get<Branding>('public_menu_branding');
      const storedOffers = await db.get<Offer[]>('public_menu_offers');
      const storedMenuItems = await db.get<MenuItem[]>('public_menu_items');
      const storedCategories = await db.get<Category[]>('public_menu_categories');
      const storedTags = await db.get<Tag[]>('public_menu_tags');

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

  const resetConfig = async () => {
    try {
      await db.clear();
      setBranding(DEFAULT_BRANDING);
      setOffers(DEFAULT_OFFERS);
      setMenuItems(MENU_ITEMS);
      setCategories(DEFAULT_CATEGORIES);
      setTags(DEFAULT_TAGS);
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
