import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, Mail, Phone, Calendar, Star, Shield, MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu } from '../../context/PublicMenuContext';

export default function UserListPage() {
  const { users = [], xpConfig } = usePublicMenu();
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lista de Usuarios</h1>
          <p className="text-sm sm:text-base text-gray-500">Gestiona tus clientes, sus niveles de fidelidad y permisos.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" /> Agregar Usuario
        </Button>
      </div>

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
                      <div className="w-10 h-10 rounded-full bg-tuplato/10 flex items-center justify-center text-tuplato font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
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
                        <span className="text-xs text-gray-500">({user.xp} XP)</span>
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
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
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
    </div>
  );
}
