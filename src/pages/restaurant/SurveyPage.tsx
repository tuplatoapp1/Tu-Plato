import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Plus, Edit2, Trash2, X, MessageSquare, BarChart2, Star, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePublicMenu } from '../../context/PublicMenuContext';

export default function SurveyPage() {
  const { surveys, addSurvey, removeSurvey, updateSurvey } = usePublicMenu();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as any[],
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSurvey(editingId, formData);
      setEditingId(null);
    } else {
      addSurvey({ ...formData, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      setIsAdding(false);
    }
    setFormData({ title: '', description: '', questions: [], isActive: true });
  };

  const handleEdit = (survey: any) => {
    setEditingId(survey.id);
    setFormData({
      title: survey.title,
      description: survey.description,
      questions: survey.questions || [],
      isActive: survey.isActive
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Encuestas</h1>
          <p className="text-sm sm:text-base text-gray-500">Recopila feedback de tus clientes para mejorar tu servicio.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nueva Encuesta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {surveys.map((survey) => (
          <motion.div 
            layout
            key={survey.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-tuplato/10 p-2 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-tuplato" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(survey)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => removeSurvey(survey.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{survey.title}</h3>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  survey.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {survey.isActive ? 'Activa' : 'Inactiva'}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">{survey.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center text-xs text-gray-500">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                  {survey.questions?.length || 0} Preguntas
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <BarChart2 className="w-4 h-4 mr-2 text-gray-400" />
                  0 Respuestas
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="secondary" className="w-full text-xs" onClick={() => alert('Próximamente: Ver resultados detallados')}>
                  Ver Resultados
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {surveys.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay encuestas creadas</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">Crea encuestas para conocer la opinión de tus clientes sobre la comida, el servicio o el local.</p>
            <Button variant="secondary" onClick={() => setIsAdding(true)} className="mt-6">
              <Plus className="w-4 h-4 mr-2" /> Crear primera encuesta
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">{editingId ? 'Editar Encuesta' : 'Nueva Encuesta'}</h3>
                <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Encuesta</label>
                    <Input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ej: ¿Qué te pareció tu visita?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Instrucciones</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Ej: Ayúdanos a mejorar respondiendo estas breves preguntas..."
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-tuplato focus:ring-tuplato"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Encuesta activa</label>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <Button variant="secondary" type="button" onClick={() => {setIsAdding(false); setEditingId(null);}}>Cancelar</Button>
                  <Button type="submit">
                    {editingId ? 'Guardar Cambios' : 'Crear Encuesta'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
