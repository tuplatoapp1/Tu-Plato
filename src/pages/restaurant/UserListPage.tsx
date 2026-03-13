import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Filter, Mail, Phone, Calendar, Star, Shield, MoreVertical, UserPlus, X, Save, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu } from '../../context/PublicMenuContext';
import { toast } from 'sonner';

export default function UserListPage() {
  const { users = [], xpConfig, updateUser, addUser } = usePublicMenu();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editXp, setEditXp] = useState<number>(0);
  const [editRole, setEditRole] = useState<string>('customer');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const [activeTab, setActiveTab] = useState<'list' | 'mascot'>('list');

  const XP_LEVELS = xpConfig?.xpLevels || [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];
  const MAX_LEVEL = XP_LEVELS.length;

  const getUserLevelInfo = (userXp: number) => {
    let currentLevel = 1;
    let nextLevelXp = XP_LEVELS[1];
    let prevLevelXp = XP_LEVELS[0];

    for (let i = 0; i < XP_LEVELS.length; i++) {
      if (userXp >= XP_LEVELS[i]) {
        currentLevel = i + 1;
        prevLevelXp = XP_LEVELS[i];
        nextLevelXp = XP_LEVELS[i + 1] || XP_LEVELS[i];
      }
    }

    const isMaxLevel = currentLevel === MAX_LEVEL;
    const xpProgress = isMaxLevel ? 100 : ((userXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

    let vipBadge = null;
    if (currentLevel >= 6) {
      switch (currentLevel) {
        case 6: vipBadge = { text: 'VIP BRONCE', color: 'bg-amber-100 text-amber-800 border-amber-200' }; break;
        case 7: vipBadge = { text: 'VIP PLATA', color: 'bg-gray-100 text-gray-800 border-gray-200' }; break;
        case 8: vipBadge = { text: 'VIP ORO', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }; break;
        case 9: vipBadge = { text: 'VIP DIAMANTE', color: 'bg-blue-100 text-blue-800 border-blue-200' }; break;
        case 10: vipBadge = { text: 'VIP PLATINO', color: 'bg-slate-200 text-slate-800 border-slate-300' }; break;
        default: vipBadge = { text: 'VIP PLATINO', color: 'bg-slate-200 text-slate-800 border-slate-300' }; break;
      }
    }

    return { currentLevel, xpProgress, vipBadge };
  };

  const filteredUsers = (users || []).filter(user => {
    const name = user?.name || '';
    const email = user?.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditXp(user.xp || 0);
    setEditRole(user.role || 'customer');
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    const success = await updateUser(selectedUser.id, {
      xp: editXp,
      role: editRole
    });

    if (success) {
      toast.success('Usuario actualizado exitosamente');
      setIsEditModalOpen(false);
    } else {
      toast.error('Error al actualizar el usuario');
    }
  };

  const handleAddUser = async () => {
    const success = await addUser(newUser);
    if (success) {
      toast.success('Usuario creado exitosamente');
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', phone: '' });
    } else {
      toast.error('Error al crear el usuario');
    }
  };

  const handleLevelChange = (level: number) => {
    if (level >= 1 && level <= MAX_LEVEL) {
      setEditXp(XP_LEVELS[level - 1]);
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lista de Usuarios</h1>
          <p className="text-sm sm:text-base text-gray-500">Gestiona tus clientes, sus niveles de fidelidad y permisos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeTab === 'list' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('list')}
            size="sm"
          >
            Lista
          </Button>
          <Button 
            variant={activeTab === 'mascot' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('mascot')}
            size="sm"
          >
            Previsualización Mascota
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm">
            <UserPlus className="w-4 h-4 mr-2" /> Agregar Usuario
          </Button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" /> Filtros
              </Button>
              <Button variant="secondary" size="sm">
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nivel / XP</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  const { currentLevel, xpProgress, vipBadge } = getUserLevelInfo(user.xp || 0);
                  return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-tuplato/10 flex items-center justify-center text-tuplato font-bold uppercase">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.name} {user.lastName}</div>
                          <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">Nivel {currentLevel}</span>
                          <span className="text-xs text-gray-500">({user.xp || 0} XP)</span>
                          {vipBadge && (
                            <div className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase flex items-center gap-1 ${vipBadge.color}`}>
                              <Star className="w-3 h-3" />
                              {vipBadge.text}
                            </div>
                          )}
                        </div>
                        <div className="w-full max-w-[150px] h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-tuplato rounded-full" 
                            style={{ width: `${xpProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {(user.role || 'customer').charAt(0).toUpperCase() + (user.role || 'customer').slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 hover:bg-tuplato/10 rounded-lg text-gray-400 hover:text-tuplato transition-colors"
                        title="Editar Usuario"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="text-gray-500">Prueba ajustando los términos de búsqueda.</p>
            </div>
          )}

          <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-bold text-gray-900">{filteredUsers.length}</span> de <span className="font-bold text-gray-900">{users.length}</span> usuarios
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled>Anterior</Button>
              <Button variant="secondary" size="sm" disabled>Siguiente</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {XP_LEVELS.map((_, index) => {
            const level = index + 1;
            const xp = XP_LEVELS[index];
            const { currentLevel, vipBadge } = getUserLevelInfo(xp);
            return (
              <div key={level} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-tuplato/10 rounded-full flex items-center justify-center text-tuplato font-black text-3xl">
                  {level}
                </div>
                <h3 className="font-bold text-gray-900">Nivel {level}</h3>
                <p className="text-sm text-gray-500 mb-2">XP: {xp}</p>
                {vipBadge && (
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${vipBadge.color}`}>
                    {vipBadge.text}
                  </div>
                )}
                <div className="mt-4 text-left text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>Nombre: [Nombre Cliente]</p>
                  <p>Nivel: {level}</p>
                  <p>Miembro desde: 13/03/2026</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Agregar Usuario</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Input label="Nombre" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                <Input label="Teléfono" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddUser}>Crear Usuario</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Editar Usuario
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-tuplato/10 flex items-center justify-center text-tuplato font-bold text-xl uppercase">
                    {selectedUser.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedUser.name} {selectedUser.lastName}</h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nivel del Usuario
                    </label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tuplato focus:border-transparent outline-none transition-all"
                      value={getUserLevelInfo(editXp).currentLevel}
                      onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                    >
                      {XP_LEVELS.map((_, index) => (
                        <option key={index} value={index + 1}>
                          Nivel {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input 
                    label="Experiencia (XP) Exacta"
                    type="number"
                    value={editXp}
                    onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                    min="0"
                  />

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Rol del Sistema
                    </label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tuplato focus:border-transparent outline-none transition-all"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="customer">Cliente (Customer)</option>
                      <option value="admin">Administrador (Admin)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser} className="flex items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
