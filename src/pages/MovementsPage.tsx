import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Search, ArrowUpRight, ArrowDownLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Pagination } from '../components/ui/Pagination';

export default function MovementsPage() {
  const { movements } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('general');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const DEPARTMENTS = [
    { id: 'general', label: 'General' },
    { id: 'caja', label: 'Caja' },
    { id: 'servicio', label: 'Servicio' },
    { id: 'barra', label: 'Barra' },
    { id: 'cocina', label: 'Cocina' },
    { id: 'deposito', label: 'Depósito' },
  ];

  const departmentMovements = activeTab === 'general' 
    ? movements 
    : movements.filter(m => m.department === activeTab);

  const filteredMovements = departmentMovements.filter(m => 
    m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
        <p className="text-gray-500">Registro completo de entradas y salidas</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Buscar por producto, usuario o motivo..." 
            className="pl-10 h-12 rounded-xl border-gray-200 shadow-sm text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Department Tabs */}
      <div className="w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex relative min-w-max">
          <div className="absolute inset-0 rounded-2xl pointer-events-none border border-gray-100/50" />
          {DEPARTMENTS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 z-10 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'text-tuplato shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-tuplato/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop View (Table) */}
      <Card className="hidden md:block shadow-sm border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Fecha</th>
                <th className="px-6 py-4 font-bold tracking-wider">Producto</th>
                {activeTab === 'general' && (
                  <th className="px-6 py-4 font-bold tracking-wider">Departamento</th>
                )}
                <th className="px-6 py-4 font-bold tracking-wider">Tipo</th>
                <th className="px-6 py-4 font-bold tracking-wider">Cantidad</th>
                <th className="px-6 py-4 font-bold tracking-wider">Stock Resultante</th>
                <th className="px-6 py-4 font-bold tracking-wider">Usuario</th>
                <th className="px-6 py-4 font-bold tracking-wider">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900">No se encontraron movimientos</p>
                      <p className="text-sm">Intenta con otra búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((movement) => (
                  <tr key={movement.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-sm">
                      {format(new Date(movement.date), "d MMM yyyy, HH:mm", { locale: es })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {movement.itemName}
                    </td>
                    {activeTab === 'general' && (
                      <td className="px-6 py-4">
                        {movement.department ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                            {movement.department}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <MovementBadge type={movement.type} />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className={movement.type === 'SALIDA' || movement.type === 'ELIMINACION' ? 'text-red-600' : 'text-green-600'}>
                        {movement.type === 'SALIDA' || movement.type === 'ELIMINACION' ? '-' : '+'}{movement.quantity}
                      </span>
                      <span className="text-xs text-gray-500 ml-1 font-sans">{movement.unit || 'unidades'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      {movement.newStock}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                        {movement.user}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate text-sm">
                      {movement.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredMovements.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </Card>

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {filteredMovements.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-900">No hay movimientos</p>
            <p className="text-sm text-gray-500 mt-1">Intenta con otra búsqueda</p>
          </div>
        ) : (
          <>
            {paginatedMovements.map((movement) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={movement.id} 
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{movement.itemName}</h3>
                    {activeTab === 'general' && movement.department && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                        {movement.department}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500">{format(new Date(movement.date), "d MMM yyyy, HH:mm", { locale: es })}</p>
                </div>
                <div className="shrink-0">
                  <MovementBadge type={movement.type} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50 flex flex-col justify-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Cantidad</p>
                  <p className={`font-mono text-xl font-bold ${movement.type === 'SALIDA' || movement.type === 'ELIMINACION' ? 'text-red-600' : 'text-green-600'}`}>
                    {movement.type === 'SALIDA' || movement.type === 'ELIMINACION' ? '-' : '+'}{movement.quantity}
                    <span className="text-xs text-gray-500 ml-1 font-sans">{movement.unit || 'unidades'}</span>
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50 flex flex-col justify-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Stock Final</p>
                  <p className="font-mono text-xl font-bold text-gray-900">{movement.newStock}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-tuplato/10 text-tuplato flex items-center justify-center text-xs font-bold">
                    {movement.user.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{movement.user}</span>
                </div>
                {movement.reason && (
                  <span className="text-[11px] font-medium text-gray-500 max-w-[140px] truncate bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100" title={movement.reason}>
                    {movement.reason}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          {filteredMovements.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
          </>
        )}
      </div>
    </div>
  );
}

function MovementBadge({ type }: { type: string }) {
  switch (type) {
    case 'ENTRADA':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ArrowUpRight className="w-3 h-3" /> Entrada
        </span>
      );
    case 'SALIDA':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ArrowDownLeft className="w-3 h-3" /> Salida
        </span>
      );
    case 'CREACION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Plus className="w-3 h-3" /> Creación
        </span>
      );
    case 'ELIMINACION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Trash2 className="w-3 h-3" /> Eliminación
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="w-3 h-3" /> Ajuste
        </span>
      );
  }
}
