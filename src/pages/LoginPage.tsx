import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Package, ChefHat } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { appLogo } = useUI();
  const navigate = useNavigate();

  const renderLogo = (iconClassName: string, imageClassName: string = "w-full h-full object-cover") => {
    if (appLogo.type === 'custom') {
      return <img src={appLogo.value} alt="Logo" className={imageClassName} />;
    }
    // @ts-ignore
    const Icon = LucideIcons[appLogo.value] || ChefHat;
    return <Icon className={iconClassName} />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      login(username);
      navigate('/');
    } else {
      setError('Por favor ingrese usuario y contraseña');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tuplato-bg relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-tuplato/5 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-tuplato-light/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-tuplato/5 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 p-4"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-tuplato p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10 flex justify-center mb-4"
            >
              <div className={`bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden mx-auto ${appLogo.type === 'custom' ? 'w-24 h-24' : 'w-20 h-20 p-4'}`}>
                {renderLogo("w-12 h-12 text-tuplato")}
              </div>
            </motion.div>
            <h2 className="relative z-10 text-3xl font-bold text-white tracking-tight">Tu Plato</h2>
            <p className="relative z-10 text-tuplato-bg/80 mt-2 text-sm">Gestión de Inventario Profesional</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Usuario"
                  placeholder="Ej. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:border-tuplato focus:ring-tuplato/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:border-tuplato focus:ring-tuplato/20 transition-all duration-300"
                />
              </div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-tuplato hover:bg-tuplato-dark text-white h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>
          
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Tu Plato. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
