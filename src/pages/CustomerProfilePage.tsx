import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Gift, Star, Trophy, User, Mail, Lock, LogOut, CheckCircle, ChevronRight, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { BurgerMascot } from '../components/BurgerMascot';

export default function CustomerProfilePage() {
  const { user, updateCustomer, logout } = useAuth();
  const { config } = useRewards();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '', // We don't show the real password, just allow updating it
    birthDate: user?.birthDate || ''
  });

  // Redirect if not logged in
  if (!user) {
    navigate('/customer-auth');
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: any = { email: formData.email, birthDate: formData.birthDate };
    // In a real app, we'd hash the password or send it to an API
    if (formData.password) {
      // Mock updating password
      updates.password = formData.password; 
    }
    
    updateCustomer(updates);
    
    // Also update in registered_customers list
    const registeredCustomers = JSON.parse(localStorage.getItem('registered_customers') || '[]');
    const updatedCustomers = registeredCustomers.map((c: any) => 
      c.username === user.username ? { ...c, ...updates } : c
    );
    localStorage.setItem('registered_customers', JSON.stringify(updatedCustomers));

    setIsEditing(false);
    toast.success('Datos actualizados correctamente');
  };

  const handleLogout = () => {
    logout();
    navigate('/public-menu');
    toast.success('Sesión cerrada');
  };

  // XP and Level Logic
  const XP_LEVELS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];
  const MAX_LEVEL = 10;
  
  const userXp = user.xp || 0;
  let currentLevel = 1;
  let nextLevelXp = XP_LEVELS[1];
  let prevLevelXp = XP_LEVELS[0];

  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (userXp >= XP_LEVELS[i]) {
      currentLevel = i + 1;
      prevLevelXp = XP_LEVELS[i];
      nextLevelXp = XP_LEVELS[i + 1] || XP_LEVELS[i]; // If max level, next is same
    }
  }

  const isMaxLevel = currentLevel === MAX_LEVEL;
  const xpProgress = isMaxLevel ? 100 : ((userXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-tuplato text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/public-menu')}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Mi Perfil</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-4">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative flex flex-col items-center"
        >
          <div className="mb-10 mt-6">
            <BurgerMascot 
              level={currentLevel} 
              className="scale-125" 
              customImage={config.customMascots?.[currentLevel]}
              customVideo={config.customVideos?.[currentLevel]}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Hola, {user.name}!</h2>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            NIVEL {currentLevel}
          </div>
          <p className="text-gray-500 text-sm">Miembro desde 2026</p>
        </motion.div>

        {/* Level & XP Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Experiencia</p>
              <p className="text-2xl font-black text-gray-900">{userXp} <span className="text-sm font-medium text-gray-500">XP</span></p>
            </div>
            <div className="text-right">
              {!isMaxLevel ? (
                <p className="text-sm text-gray-500 font-medium">Faltan <span className="text-tuplato font-bold">{nextLevelXp - userXp} XP</span> para Nivel {currentLevel + 1}</p>
              ) : (
                <p className="text-sm text-yellow-500 font-bold">¡Nivel Máximo Alcanzado!</p>
              )}
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Gana 1 XP por cada $1 gastado en tus pedidos.</p>
        </motion.div>

        {/* Points Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-tuplato/20 rounded-full blur-xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-tuplato-light mb-1">
                <Gift className="w-5 h-5" />
                <span className="font-medium uppercase tracking-wider text-sm">Puntos Canjeables</span>
              </div>
              <div className="text-4xl font-black tracking-tight">
                {user.points || 0}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">Próximo Premio</p>
              <p className="font-bold text-yellow-400">500 pts</p>
            </div>
          </div>
        </motion.div>

        {/* Prizes Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-tuplato" />
              Premios Ganados
            </h3>
          </div>
          
          <div className="space-y-3">
            {user.prizes && user.prizes.length > 0 ? (
              user.prizes.map((prize, idx) => (
                <div key={prize.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-tuplato/10 p-3 rounded-full text-tuplato shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{prize.name}</h4>
                    <p className="text-sm text-gray-500">{prize.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aún no tienes premios. ¡Sigue acumulando puntos!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Personal Data Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-tuplato" />
              Mis Datos
            </h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-tuplato text-sm font-medium flex items-center gap-1 hover:underline"
            >
              {isEditing ? 'Cancelar' : <><Edit2 className="w-4 h-4" /> Editar</>}
            </button>
          </div>
          
          <div className="p-5">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
                <Input
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <Button type="submit" className="w-full mt-2">
                  Guardar Cambios
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Nombre Completo</p>
                    <p className="font-medium text-gray-900">{user.name} {user.lastName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Correo Electrónico</p>
                    <p className="font-medium text-gray-900">{user.email || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Fecha de Nacimiento</p>
                    <p className="font-medium text-gray-900">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Contraseña</p>
                    <p className="font-medium text-gray-900">••••••••</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <button 
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </motion.div>
      </main>
    </div>
  );
}
