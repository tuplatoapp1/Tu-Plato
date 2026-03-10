import React, { useMemo, useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Card, CardContent } from '../components/ui/Card';
import { Quote, ChefHat, Sun, Sunset, Moon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

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
  const { appLogo } = useUI();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Select a message based on the day of the year so it changes daily
  const dailyMessage = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
  }, []);

  const renderLogo = (iconClassName: string, imageClassName: string = "w-32 h-32 object-cover rounded-full opacity-20") => {
    if (appLogo.type === 'custom') {
      return <img src={appLogo.value} alt="Logo" className={imageClassName} />;
    }
    // @ts-ignore
    const Icon = LucideIcons[appLogo.value] || ChefHat;
    return <Icon className={iconClassName} />;
  };

  const hour = time.getHours();
  let greeting = 'Buenas noches';
  let themeClasses = 'from-indigo-900 via-slate-800 to-slate-900 text-white shadow-indigo-900/20';
  let TimeIcon = Moon;

  if (hour >= 5 && hour < 12) {
    greeting = 'Buenos días';
    themeClasses = 'from-amber-400 via-orange-400 to-orange-500 text-white shadow-orange-500/20';
    TimeIcon = Sun;
  } else if (hour >= 12 && hour < 19) {
    greeting = 'Buenas tardes';
    themeClasses = 'from-blue-500 via-cyan-500 to-teal-400 text-white shadow-blue-500/20';
    TimeIcon = Sunset;
  }

  let h = time.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');
  
  const timeString = `${h}:${m}`;
  const secondsString = s;
  const dateString = time.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Dynamic Greeting & Clock Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-2xl bg-gradient-to-br ${themeClasses}`}
      >
        {/* Background decorative element */}
        <div className="absolute -top-20 -right-20 opacity-10 pointer-events-none transform rotate-12 transition-transform duration-1000">
          <TimeIcon className="w-80 h-80" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <TimeIcon className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {greeting}, {user?.name?.split(' ')[0] || 'Equipo'}
              </h1>
            </div>
            <p className="text-lg md:text-xl opacity-90 capitalize font-medium flex items-center gap-2">
              {dateString}
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-inner flex items-center justify-center min-w-[200px]">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums">
                {timeString}
              </span>
              <span className="text-xl md:text-2xl font-bold opacity-80 tabular-nums">
                :{secondsString} {ampm}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Motivational Message Card */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-tuplato to-tuplato-dark text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              {renderLogo("w-40 h-40")}
            </div>
            <CardContent className="p-10 md:p-12 flex flex-col items-center text-center relative z-10">
              <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm shadow-inner">
                <Quote className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight max-w-3xl">
                "{dailyMessage}"
              </h2>
              <p className="text-tuplato-bg/80 font-bold uppercase tracking-widest text-xs md:text-sm">
                Mensaje del día
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
