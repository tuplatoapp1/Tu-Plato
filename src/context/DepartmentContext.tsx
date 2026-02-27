import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Department {
  id: string;
  name: string;
  icon: string; // Lucide icon name or custom image URL
  type: 'lucide' | 'custom';
}

interface DepartmentContextType {
  departments: Department[];
  addDepartment: (name: string, icon: string, type: 'lucide' | 'custom') => void;
  removeDepartment: (id: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('departments');
    if (stored) {
      try {
        setDepartments(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse departments", e);
      }
    } else {
      // Default departments
      setDepartments([
        { id: '1', name: 'Cocina', icon: 'ChefHat', type: 'lucide' },
        { id: '2', name: 'Barra', icon: 'Coffee', type: 'lucide' },
        { id: '3', name: 'Depósito', icon: 'Package', type: 'lucide' },
        { id: '4', name: 'Servicio', icon: 'Utensils', type: 'lucide' },
        { id: '5', name: 'Caja', icon: 'DollarSign', type: 'lucide' },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [departments]);

  const addDepartment = (name: string, icon: string, type: 'lucide' | 'custom') => {
    const newDept: Department = { id: Date.now().toString(), name, icon, type };
    setDepartments(prev => [...prev, newDept]);
  };

  const removeDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <DepartmentContext.Provider value={{ departments, addDepartment, removeDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  const context = useContext(DepartmentContext);
  if (!context) throw new Error('useDepartments must be used within DepartmentProvider');
  return context;
}
