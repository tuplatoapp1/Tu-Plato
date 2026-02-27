import React, { useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Package, AlertTriangle, Activity, Quote, ChefHat } from 'lucide-react';

const MOTIVATIONAL_MESSAGES = [
  "¡Cada plato es una sonrisa que servimos al mundo!",
  "La excelencia no es un acto, es un hábito. ¡Hoy servimos lo mejor!",
  "El ingrediente secreto siempre es el amor y la dedicación.",
  "Un equipo unido cocina el éxito a fuego lento.",
  "Tu esfuerzo hace que cada cliente se sienta en casa.",
  "La cocina es el corazón del restaurante, y tú eres su latido.",
  "Hoy es un gran día para crear experiencias inolvidables.",
  "La calidad nunca es un accidente, es el resultado de un esfuerzo inteligente.",
  "Cocinar es hacer trozos de amor comestibles.",
  "El servicio es el arte de hacer feliz a los demás."
];

export default function HomePage() {
  const { user } = useAuth();
  const { items, movements } = useInventory();

  const lowStockItems = items.filter(i => i.quantity <= i.minStock);

  // Select a message based on the day of the year so it changes daily
  const dailyMessage = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-tuplato/10 p-6 rounded-2xl border border-tuplato/20">
        <h1 className="text-3xl font-bold text-tuplato">¡Bienvenido, {user?.name}!</h1>
        <p className="text-tuplato-light mt-2">Resumen de la actividad de Tu Plato.</p>
      </div>

      {/* KPI Cards removed as requested */}
      
      {/* Motivational Message Card */}
      <div className="max-w-3xl mx-auto">
        <Card className="bg-gradient-to-br from-tuplato to-tuplato-dark text-white shadow-xl border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ChefHat className="w-32 h-32" />
          </div>
          <CardContent className="p-10 flex flex-col items-center text-center relative z-10">
            <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm">
              <Quote className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
              "{dailyMessage}"
            </h2>
            <p className="text-tuplato-bg/80 font-medium uppercase tracking-widest text-xs">
              Mensaje del día
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
