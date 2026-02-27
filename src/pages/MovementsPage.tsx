import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Search, ArrowUpRight, ArrowDownLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MovementsPage() {
  const { movements } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = movements.filter(m => 
    m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
        <p className="text-gray-500">Registro completo de entradas y salidas</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar por producto, usuario o motivo..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Cantidad</th>
                <th className="px-6 py-3">Stock Resultante</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(movement.date), "d MMM yyyy, HH:mm", { locale: es })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {movement.itemName}
                    </td>
                    <td className="px-6 py-4">
                      <MovementBadge type={movement.type} />
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {movement.type === 'SALIDA' ? '-' : '+'}{movement.quantity}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                      {movement.newStock}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {movement.user}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {movement.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
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
