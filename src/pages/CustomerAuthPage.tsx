import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, ChefHat, UserPlus, LogIn, Gift, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerAuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const { loginCustomer } = useAuth();
  const { appLogo } = useUI();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    documentId: '',
    phone: '',
    email: '',
    birthDate: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Mock login
      loginCustomer({
        username: formData.documentId,
        name: formData.name || 'Cliente',
        documentId: formData.documentId,
        role: 'customer'
      });
    } else {
      // Mock register
      loginCustomer({
        username: formData.email,
        name: formData.name,
        lastName: formData.lastName,
        documentId: formData.documentId,
        phone: formData.phone,
        email: formData.email,
        birthDate: formData.birthDate,
        role: 'customer'
      });
    }
    
    navigate('/public-menu');
  };

  const renderLogo = () => {
    if (appLogo.type === 'custom') {
      return <img src={appLogo.value} alt="Logo" className="w-20 h-20 object-cover rounded-full shadow-md" />;
    }
    // @ts-ignore
    const Icon = LucideIcons[appLogo.value] || ChefHat;
    return <Icon className="w-20 h-20 text-tuplato" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/public-menu')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al menú
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <div className="flex justify-center mb-6">
              {renderLogo()}
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h2>
            <p className="text-center text-gray-500 mb-8">
              {isLogin ? 'Ingresa para continuar con tu pedido' : 'Regístrate para pedir más rápido'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-tuplato/10 to-tuplato/5 border border-tuplato/20 rounded-2xl p-4 flex items-start gap-4">
                      <div className="bg-white shadow-sm p-2.5 rounded-full text-tuplato shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-lg">
                          ¡Únete y Gana! <Sparkles className="w-4 h-4 text-yellow-500" />
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          Acumula puntos por cada pedido que realices y canjéalos por <span className="font-semibold text-tuplato">premios y descuentos</span> exclusivos.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <Input
                      label="Apellido"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              <Input
                label="Cédula de Identidad"
                required
                value={formData.documentId}
                onChange={e => setFormData({...formData, documentId: e.target.value})}
              />

              {!isLogin && (
                <>
                  <Input
                    label="Teléfono"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </>
              )}
              
              <Input
                label="Contraseña"
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />

              <Button type="submit" className="w-full h-12 text-lg mt-6">
                {isLogin ? (
                  <><LogIn className="w-5 h-5 mr-2" /> Iniciar Sesión</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2" /> Registrarse</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-tuplato font-medium hover:underline"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
