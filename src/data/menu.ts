export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entradas' | 'principales' | 'bebidas' | 'postres';
  image: string;
  isAvailable: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Bruschetta Italiana',
    description: 'Pan rústico tostado con tomate fresco, albahaca, ajo y aceite de oliva virgen extra.',
    price: 8.50,
    category: 'entradas',
    image: 'https://images.unsplash.com/photo-1572695157363-bc31c5d4efb5?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '2',
    name: 'Carpaccio de Res',
    description: 'Finas láminas de solomillo con rúcula, parmesano reggiano y reducción de balsámico.',
    price: 12.90,
    category: 'entradas',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '3',
    name: 'Risotto de Setas',
    description: 'Arroz arborio cremoso con mezcla de setas silvestres, trufa negra y parmesano.',
    price: 18.00,
    category: 'principales',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '4',
    name: 'Salmón a la Parrilla',
    description: 'Filete de salmón fresco con espárragos trigueros y salsa de limón y eneldo.',
    price: 22.50,
    category: 'principales',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '5',
    name: 'Tiramisú Clásico',
    description: 'Capas de bizcocho empapado en café, crema de mascarpone y cacao en polvo.',
    price: 7.50,
    category: 'postres',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '6',
    name: 'Cheesecake de Frutos Rojos',
    description: 'Tarta de queso cremosa con base de galleta y coulis de frutos del bosque.',
    price: 8.00,
    category: 'postres',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '7',
    name: 'Mojito Cubano',
    description: 'Ron blanco, hierbabuena fresca, lima, azúcar y soda.',
    price: 9.00,
    category: 'bebidas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    id: '8',
    name: 'Limonada Casera',
    description: 'Limones frescos exprimidos con un toque de menta y jengibre.',
    price: 4.50,
    category: 'bebidas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  }
];
