import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePublicMenu } from '../context/PublicMenuContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Gift, Star, Trophy, User, Mail, Lock, LogOut, CheckCircle, ChevronRight, Edit2, ClipboardList, Gamepad2, X, Search, BookOpen, Users, AlertCircle, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { BurgerMascot } from '../components/BurgerMascot';

export default function CustomerProfilePage() {
  const { user, updateCustomer, logout } = useAuth();
  const { surveys, rewards, xpConfig } = usePublicMenu();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'rewards' | 'tasks'>('profile');
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '', // We don't show the real password, just allow updating it
    birthDate: user?.birthDate || ''
  });

  // Referral Link Generation
  const referralLink = `${window.location.origin}/customer-auth?ref=${user?.id || user?.username}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('¡Enlace de invitación copiado!');
  };

  const handleRedeem = (prize: any) => {
    const required = prize.xpRequired || prize.pointsRequired;
    if ((user.points || 0) >= required) {
      const newPoints = (user.points || 0) - required;
      const newPrize = {
        id: crypto.randomUUID(),
        name: prize.title || prize.name,
        description: prize.description,
        date: new Date().toISOString().split('T')[0],
        status: 'active' as const
      };
      
      updateCustomer({
        points: newPoints,
        prizes: [...(user.prizes || []), newPrize]
      });
      
      toast.success(`¡Has canjeado: ${prize.title || prize.name}!`);
    } else {
      toast.error('No tienes suficientes puntos para este premio');
    }
  };

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
  const XP_LEVELS = xpConfig.xpLevels || [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];
  const MAX_LEVEL = XP_LEVELS.length;
  
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

  const getVipBadge = (level: number) => {
    if (level < 6) return null;
    switch (level) {
      case 6: return { text: 'VIP BRONCE', color: 'from-amber-600 to-amber-800 text-white' };
      case 7: return { text: 'VIP PLATA', color: 'from-gray-400 to-gray-600 text-white' };
      case 8: return { text: 'VIP ORO', color: 'from-yellow-400 to-yellow-600 text-white' };
      case 9: return { text: 'VIP DIAMANTE', color: 'from-blue-400 to-blue-600 text-white' };
      case 10: return { text: 'VIP PLATINO', color: 'from-slate-200 to-slate-400 text-slate-800' };
      default: return { text: 'VIP PLATINO', color: 'from-slate-200 to-slate-400 text-slate-800' };
    }
  };

  const vipBadge = getVipBadge(currentLevel);

  return (
    <div className="min-h-screen bg-white pb-20">
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

      {/* Tab Navigation (Top) */}
      <div className="max-w-md mx-auto px-4 mt-4 relative z-20">
        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 relative z-30 shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 rounded-xl text-[10px] xs:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'profile' 
                ? 'bg-white text-tuplato shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-3 rounded-xl text-[10px] xs:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'rewards' 
                ? 'bg-white text-tuplato shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gift className="w-4 h-4" />
            Premios
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 rounded-xl text-[10px] xs:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'tasks' 
                ? 'bg-white text-tuplato shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Tareas
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto space-y-6 mt-0">
        {activeTab === 'profile' ? (
          <>
            {/* Welcome Section & Mascot */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center relative flex flex-col items-center pt-0"
            >
              {/* Mascot flush with tabs */}
              <div className="w-full h-56 flex items-center justify-center -mt-4 relative z-10">
                <BurgerMascot 
                  level={currentLevel} 
                  className="w-full h-full"
                  customImage={xpConfig.customMascots?.[currentLevel]}
                  customVideo={xpConfig.customVideos?.[currentLevel]}
                />
              </div>

              {/* User Info */}
              <div className="relative z-30 px-4 w-full -mt-6 mb-6">
                <h2 className="text-3xl font-black text-gray-900 mb-2 drop-shadow-sm">
                  ¡Hola, {user.name}!
                </h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 w-fit">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    NIVEL {currentLevel}
                  </div>
                  {vipBadge && (
                    <div className={`bg-gradient-to-r ${vipBadge.color} text-xs font-black px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 w-fit`}>
                      <Trophy className="w-3.5 h-3.5 fill-current" />
                      {vipBadge.text}
                    </div>
                  )}
                </div>
                <p className="text-gray-800 text-[10px] font-bold uppercase tracking-widest">
                  Miembro desde 2026
                </p>
              </div>
            </motion.div>

            <div className="px-4 space-y-6 pb-4">
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
        </div>
        </>
        ) : activeTab === 'rewards' ? (
          <div className="px-4 pt-6 space-y-6 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-1">Premios Canjeables</h2>
                <p className="text-white/90 text-sm">Usa tus puntos para obtener platos gratis y descuentos exclusivos.</p>
                <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  <Star className="w-4 h-4 fill-current text-yellow-200" />
                  <span className="font-black text-lg">{user.points || 0} Puntos Disponibles</span>
                </div>
              </div>
              <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
            </motion.div>

            <div className="space-y-4">
              {rewards.map((prize, index) => {
                const canAfford = (user.points || 0) >= (prize.xpRequired || 1);
                const progress = prize.xpRequired > 0 
                  ? Math.min(100, ((user.points || 0) / prize.xpRequired) * 100)
                  : 100;
                
                return (
                  <motion.div
                    key={prize.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative group bg-white rounded-3xl p-4 shadow-sm border transition-all duration-300 flex items-center gap-4 ${
                      canAfford 
                        ? 'border-tuplato/20 hover:shadow-xl hover:shadow-tuplato/10 hover:-translate-y-1' 
                        : 'border-gray-100 grayscale-[0.5] opacity-90'
                    }`}
                  >
                    {/* Icon/Visual Area */}
                    <div className={`w-24 h-24 shrink-0 rounded-2xl flex items-center justify-center relative overflow-hidden transition-colors p-2 ${
                      canAfford ? 'bg-tuplato/5' : 'bg-gray-50'
                    }`}>
                      {prize.image ? (
                        <img 
                          src={prize.image} 
                          alt={prize.title} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Gift className={`w-10 h-10 ${canAfford ? 'text-tuplato' : 'text-gray-300'}`} />
                      )}
                      
                      {!canAfford && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      {/* Progress Bar for locked items */}
                      {!canAfford && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-tuplato/30"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-black text-gray-900 text-base leading-tight truncate">
                          {prize.title}
                        </h4>
                        <div className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                          canAfford ? 'bg-tuplato/10 text-tuplato' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Star className="w-3 h-3 fill-current" />
                          {prize.xpRequired}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-snug mb-3">
                        {prize.description}
                      </p>

                      <Button 
                        size="sm" 
                        disabled={!canAfford}
                        onClick={() => handleRedeem(prize)}
                        className={`w-full rounded-xl py-4 font-black text-xs transition-all ${
                          canAfford 
                            ? 'bg-tuplato hover:bg-tuplato-dark shadow-md shadow-tuplato/20' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Canjear Premio' : `Te faltan ${prize.xpRequired - (user.points || 0)} pts`}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Historial de Premios */}
            <div className="mt-10">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-tuplato" />
                Historial de Premios
              </h3>
              
              <div className="space-y-3">
                {user.prizes && user.prizes.length > 0 ? (
                  user.prizes.map((prize, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${prize.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      <div className={`p-3 rounded-2xl shrink-0 ${prize.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                        <Gift className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-bold text-sm ${prize.status === 'active' ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{prize.name}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${prize.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {prize.status === 'active' ? 'Activo' : 'Usado'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{prize.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Canjeado el {new Date(prize.date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 border-dashed text-center">
                    <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Aún no tienes historial de premios.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 space-y-6 pb-20">
            {/* Tasks Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-tuplato to-tuplato-dark rounded-3xl p-6 text-white shadow-xl"
            >
              <h2 className="text-2xl font-black mb-1">Centro de Misiones</h2>
              <p className="text-white/80 text-sm">Completa tareas y juega para ganar XP extra y subir de nivel.</p>
            </motion.div>

            {/* Referral Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-tuplato/20 overflow-hidden relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-tuplato/10 p-3 rounded-2xl text-tuplato">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Invita y Gana</h3>
                    <p className="text-xs text-tuplato font-bold">¡Gana 200 puntos por cada amigo!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReferralInfo(!showReferralInfo)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Comparte tu enlace con amigos. Ganarás puntos canjeables cuando se registren y realicen su <span className="font-bold text-tuplato">primer pedido</span>.
              </p>

              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-500 font-mono truncate flex items-center">
                  {referralLink}
                </div>
                <Button onClick={copyReferralLink} className="rounded-2xl px-6">
                  Copiar
                </Button>
              </div>

              <AnimatePresence>
                {showReferralInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-500 space-y-2"
                  >
                    <p>• El invitado debe ser un usuario nuevo.</p>
                    <p>• Los puntos se acreditan automáticamente tras el primer pedido del invitado.</p>
                    <p>• No hay límite de amigos invitados.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          {/* Surveys as Tasks */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-1">
              <ClipboardList className="w-5 h-5 text-tuplato" />
              Encuestas Disponibles
            </h3>
            
            <div className="grid gap-4">
              {surveys.filter(s => {
                if (!s.isActive) return false;
                if (user?.completedSurveys?.includes(s.id)) return false;
                if (s.targetType === 'level') {
                  const currentLevel = Math.floor((user?.xp || 0) / 100) + 1;
                  return currentLevel >= (s.targetValue || 1);
                }
                if (s.targetType === 'specific') {
                  return (s.targetValue || []).includes(user?.username);
                }
                return true;
              }).length > 0 ? (
                surveys.filter(s => {
                  if (!s.isActive) return false;
                  if (user?.completedSurveys?.includes(s.id)) return false;
                  if (s.targetType === 'level') {
                    const currentLevel = Math.floor((user?.xp || 0) / 100) + 1;
                    return currentLevel >= (s.targetValue || 1);
                  }
                  if (s.targetType === 'specific') {
                    return (s.targetValue || []).includes(user?.username);
                  }
                  return true;
                }).map((survey) => (
                  <motion.div
                    key={survey.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSurvey(survey)}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer"
                  >
                    <div className="bg-tuplato/10 p-4 rounded-2xl text-tuplato shrink-0">
                      <Star className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{survey.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{survey.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                          +{survey.rewardXP} XP
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No hay encuestas disponibles en este momento.</p>
                </div>
              )}
            </div>
          </div>

          {/* Games Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-1">
              <Gamepad2 className="w-5 h-5 text-tuplato" />
              Juegos y Diversión
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3"
              >
                <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Ruleta Diaria</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Gira y gana premios</p>
                </div>
                <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Próximamente</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3"
              >
                <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Quiz Gourmet</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Demuestra lo que sabes</p>
                </div>
                <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Próximamente</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3"
              >
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Sopa de Letras</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Encuentra los platos</p>
                </div>
                <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Próximamente</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3"
              >
                <div className="bg-green-100 p-4 rounded-2xl text-green-600">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Álbum</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Colecciona tus platos</p>
                </div>
                <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Próximamente</span>
              </motion.div>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Survey Modal Placeholder */}
      <AnimatePresence>
        {selectedSurvey && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl text-gray-900">{selectedSurvey.title}</h3>
                  <p className="text-xs text-gray-500">Gana {selectedSurvey.rewardXP} XP al completar</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSurvey(null);
                    setAnswers({});
                  }}
                  className="p-2 bg-gray-100 rounded-full text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {selectedSurvey.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="space-y-4">
                    <h4 className="font-bold text-gray-800 leading-tight">
                      <span className="text-tuplato mr-2">{idx + 1}.</span>
                      {q.text}
                    </h4>
                    
                    {q.type === 'rating' && (
                      <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isSelected = (answers[q.id] || 0) >= star;
                          return (
                            <button
                              key={star}
                              onClick={() => setAnswers({ ...answers, [q.id]: star })}
                              className={`flex-1 aspect-square rounded-2xl border transition-all flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-yellow-50 border-yellow-200 text-yellow-400 scale-105 shadow-sm' 
                                  : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                              }`}
                            >
                              <Star className={`w-6 h-6 ${isSelected ? 'fill-current' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                    
                    {q.type === 'text' && (
                      <textarea 
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:ring-2 focus:ring-tuplato/20 focus:border-tuplato h-24 resize-none"
                        placeholder="Escribe tu respuesta aquí..."
                      />
                    )}
                    
                    {q.type === 'multiple_choice' && (
                      <div className="grid gap-2">
                        {q.options?.map((opt: string) => {
                          const isSelected = answers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                              className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-tuplato/10 border-tuplato text-tuplato shadow-sm'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-tuplato hover:bg-tuplato/5'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <Button 
                  className="w-full py-4 rounded-2xl font-black text-lg shadow-xl"
                  onClick={() => {
                    const reward = selectedSurvey.rewardXP || 0;
                    const completedSurveys = [...(user?.completedSurveys || []), selectedSurvey.id];
                    updateCustomer({ 
                      xp: (user?.xp || 0) + reward,
                      completedSurveys 
                    });
                    toast.success(`¡Encuesta completada! Has ganado ${reward} XP`);
                    setSelectedSurvey(null);
                    setAnswers({});
                  }}
                >
                  Enviar y Ganar XP
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
