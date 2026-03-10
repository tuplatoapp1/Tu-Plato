import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  loginCustomer: (customerData: User) => void;
  updateCustomer: (customerData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('inventory_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string) => {
    const newUser: User = { username, name: username, role: 'admin' };
    setUser(newUser);
    localStorage.setItem('inventory_user', JSON.stringify(newUser));
  };

  const loginCustomer = (customerData: User) => {
    // Mock initial points and prizes for demo purposes if they don't exist
    const newUser: User = { 
      ...customerData, 
      role: 'customer',
      points: customerData.points || 450,
      xp: customerData.xp || 1250,
      prizes: customerData.prizes || [
        { id: '1', name: 'Hamburguesa Clásica Gratis', description: 'Canjeable en tu próximo pedido', date: '2026-03-01' },
        { id: '2', name: '15% de Descuento', description: 'Válido para toda la cuenta', date: '2026-03-05' }
      ]
    };
    setUser(newUser);
    localStorage.setItem('inventory_user', JSON.stringify(newUser));
  };

  const updateCustomer = (customerData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...customerData };
      setUser(updatedUser);
      localStorage.setItem('inventory_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inventory_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginCustomer, updateCustomer, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
