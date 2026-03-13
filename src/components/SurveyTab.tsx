import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, CheckCircle, Ban, X, ClipboardList, Star, Type, List, Save, Users, Target, UserCheck, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { usePublicMenu, Survey, SurveyQuestion } from '../context/PublicMenuContext';

export default function SurveyTab() {
  const { surveys, addSurvey, updateSurvey, removeSurvey } = usePublicMenu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Partial<Survey> | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Get customers for specific targeting
  const customers = JSON.parse(localStorage.getItem('registered_customers') || '[]');

  const handleSaveSurvey = async () => {
    if (!editingSurvey || !editingSurvey.title) return;

    const surveyData = {
      title: editingSurvey.title || '',
      description: editingSurvey.description || '',
      isActive: editingSurvey.isActive ?? true,
      questions: editingSurvey.questions || [],
      rewardXP: editingSurvey.rewardXP || 0,
      targetType: editingSurvey.targetType || 'all',
      targetValue: editingSurvey.targetValue || null
    };

    if (editingSurvey.id) {
      await updateSurvey(editingSurvey.id, surveyData);
    } else {
      await addSurvey(surveyData);
    }
    setIsModalOpen(false);
    setEditingSurvey(null);
  };

  const openNewSurveyModal = () => {
    setEditingSurvey({
      title: '',
      description: '',
      isActive: true,
      questions: [
        { id: crypto.randomUUID(), text: '¿Qué te pareció la comida?', type: 'rating' },
        { id: crypto.randomUUID(), text: '¿Cómo fue el servicio?', type: 'rating' },
        { id: crypto.randomUUID(), text: '¿Algún comentario adicional?', type: 'text' }
      ],
      rewardXP: 50,
      targetType: 'all',
      targetValue: null
    });
    setIsModalOpen(true);
  };

  const openEditSurveyModal = (survey: Survey) => {
    setEditingSurvey(survey);
    setIsModalOpen(true);
  };

  const handleDeleteSurvey = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta encuesta?')) {
      await removeSurvey(id);
    }
  };

  const addQuestion = () => {
    if (!editingSurvey) return;
    const newQuestion: SurveyQuestion = {
      id: crypto.randomUUID(),
      text: '',
      type: 'rating'
    };
    setEditingSurvey({
      ...editingSurvey,
      questions: [...(editingSurvey.questions || []), newQuestion]
    });
  };

  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    if (!editingSurvey) return;
    const newQuestions = (editingSurvey.questions || []).map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    setEditingSurvey({ ...editingSurvey, questions: newQuestions });
  };

  const removeQuestion = (id: string) => {
    if (!editingSurvey) return;
    const newQuestions = (editingSurvey.questions || []).filter(q => q.id !== id);
    setEditingSurvey({ ...editingSurvey, questions: newQuestions });
  };

  const addOption = (questionId: string) => {
    if (!editingSurvey) return;
    const newQuestions = (editingSurvey.questions || []).map(q => {
      if (q.id === questionId) {
        const options = [...(q.options || []), ''];
        return { ...q, options };
      }
      return q;
    });
    setEditingSurvey({ ...editingSurvey, questions: newQuestions });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    if (!editingSurvey) return;
    const newQuestions = (editingSurvey.questions || []).map(q => {
      if (q.id === questionId) {
        const options = [...(q.options || [])];
        options[optionIndex] = value;
        return { ...q, options };
      }
      return q;
    });
    setEditingSurvey({ ...editingSurvey, questions: newQuestions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    if (!editingSurvey) return;
    const newQuestions = (editingSurvey.questions || []).map(q => {
      if (q.id === questionId) {
        const options = (q.options || []).filter((_, i) => i !== optionIndex);
        return { ...q, options };
      }
      return q;
    });
    setEditingSurvey({ ...editingSurvey, questions: newQuestions });
  };

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.username.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Encuestas de Satisfacción</h2>
          <p className="text-gray-500 mt-1 font-medium">Conoce la opinión de tus clientes y recompénsalos con XP.</p>
        </div>
        <Button onClick={openNewSurveyModal} className="bg-tuplato text-white hover:bg-tuplato-dark shadow-xl shadow-tuplato/20 px-6 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          <span className="font-bold">Nueva Encuesta</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <motion.div
            key={survey.id}
            layoutId={survey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={`group bg-white rounded-[2.5rem] p-8 shadow-sm border-2 transition-all ${
              survey.isActive ? 'border-gray-100 hover:border-tuplato/30 hover:shadow-xl hover:shadow-tuplato/5' : 'border-gray-200 bg-gray-50/50 grayscale opacity-70'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-3xl ${survey.isActive ? 'bg-tuplato/10 text-tuplato' : 'bg-gray-200 text-gray-500'} transition-colors group-hover:scale-110 duration-300`}>
                <ClipboardList className="w-8 h-8" />
              </div>
              <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                <button 
                  onClick={() => updateSurvey(survey.id, { isActive: !survey.isActive })}
                  className={`p-2 rounded-lg transition-all ${
                    survey.isActive 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-200'
                  }`}
                  title={survey.isActive ? "Desactivar" : "Activar"}
                >
                  {survey.isActive ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => openEditSurveyModal(survey)}
                  className="p-2 text-gray-400 hover:text-tuplato hover:bg-tuplato/10 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteSurvey(survey.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 leading-tight">{survey.title}</h3>
              <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">{survey.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-600">
                    {survey.targetType === 'all' ? 'Todos' : 
                     survey.targetType === 'level' ? `Nivel ${survey.targetValue}+` : 
                     `${survey.targetValue?.length || 0} Clientes`}
                  </span>
                </div>
                {survey.isActive ? (
                  <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                    <div className="w-1 h-1 rounded-full bg-green-600 animate-pulse" />
                    Activa
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-bold">
                    Inactiva
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recompensa</span>
                <span className="text-lg font-black text-tuplato">+{survey.rewardXP} XP</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preguntas</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-lg font-black text-gray-900">{survey.questions.length}</span>
                  <div className="flex -space-x-1">
                    {survey.questions.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-tuplato/30 border border-white" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {surveys.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ClipboardList className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Tu buzón de feedback está vacío</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-3 font-medium">Crea encuestas dinámicas para que tus clientes te cuenten su experiencia y ganen XP.</p>
          <Button onClick={openNewSurveyModal} className="mt-10 bg-gray-900 text-white hover:bg-black px-8 py-6 rounded-2xl font-bold shadow-xl">
            Empezar ahora
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && editingSurvey && (
          <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl h-[92vh] sm:h-auto sm:max-h-[92vh] flex flex-col border border-white/20"
            >
              <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                <div>
                  <h3 className="font-black text-xl sm:text-2xl text-gray-900">{editingSurvey.id ? 'Editar Encuesta' : 'Diseñar Nueva Encuesta'}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Configura las preguntas y recompensas</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400">
                  <X className="w-5 h-5 sm:w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 space-y-10 overflow-y-auto flex-1 custom-scrollbar pb-32 sm:pb-8">
                {/* Basic Info Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-tuplato rounded-full" />
                    <h4 className="font-black text-gray-900 uppercase tracking-wider text-sm">Información General</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Título de la Encuesta</label>
                      <Input 
                        value={editingSurvey.title}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, title: e.target.value })}
                        placeholder="Ej: ¿Cómo estuvo tu experiencia hoy?"
                        className="rounded-2xl border-gray-200 focus:border-tuplato h-14 font-bold text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Recompensa (XP)</label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={editingSurvey.rewardXP || 0}
                          onChange={(e) => setEditingSurvey({ ...editingSurvey, rewardXP: parseInt(e.target.value) || 0 })}
                          placeholder="50"
                          className="rounded-2xl border-gray-200 focus:border-tuplato h-14 font-black text-lg pl-12"
                        />
                        <Star className="w-5 h-5 text-tuplato absolute left-4 top-1/2 -translate-y-1/2 fill-tuplato/20" />
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descripción o Instrucciones</label>
                      <textarea
                        value={editingSurvey.description}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, description: e.target.value })}
                        placeholder="Cuéntales a tus clientes por qué su opinión es valiosa..."
                        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tuplato/10 focus:border-tuplato h-24 resize-none transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Targeting Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-tuplato rounded-full" />
                    <h4 className="font-black text-gray-900 uppercase tracking-wider text-sm">Segmentación de Clientes</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: 'all', label: 'Todos los Clientes', icon: Users },
                        { id: 'level', label: 'Por Nivel', icon: Target },
                        { id: 'specific', label: 'Clientes Específicos', icon: UserCheck }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setEditingSurvey({ ...editingSurvey, targetType: type.id as any, targetValue: type.id === 'level' ? 1 : [] })}
                          className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                            editingSurvey.targetType === type.id 
                              ? 'bg-tuplato text-white border-tuplato shadow-lg shadow-tuplato/20' 
                              : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {editingSurvey.targetType === 'level' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 p-6 rounded-3xl border border-gray-100"
                      >
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nivel Mínimo Requerido</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={editingSurvey.targetValue || 1}
                            onChange={(e) => setEditingSurvey({ ...editingSurvey, targetValue: parseInt(e.target.value) || 1 })}
                            className="flex-1 accent-tuplato"
                          />
                          <span className="bg-white px-4 py-2 rounded-xl border border-gray-200 font-black text-tuplato">
                            Lvl {editingSurvey.targetValue || 1}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {editingSurvey.targetType === 'specific' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 p-6 rounded-3xl border border-gray-100"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Seleccionar Clientes</label>
                          <div className="relative w-full sm:w-64">
                            <Input 
                              value={customerSearch}
                              onChange={(e) => setCustomerSearch(e.target.value)}
                              placeholder="Buscar cliente..."
                              className="rounded-xl border-gray-200 h-10 pl-10 text-xs"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                          <button 
                            onClick={() => {
                              const allUsernames = customers.map((c: any) => c.username);
                              const current = editingSurvey.targetValue || [];
                              const next = current.length === allUsernames.length ? [] : allUsernames;
                              setEditingSurvey({ ...editingSurvey, targetValue: next });
                            }}
                            className="text-[10px] font-black text-tuplato uppercase tracking-widest hover:underline shrink-0"
                          >
                            {(editingSurvey.targetValue || []).length === customers.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer: any) => (
                              <button
                                key={customer.username}
                                onClick={() => {
                                  const current = editingSurvey.targetValue || [];
                                  const next = current.includes(customer.username)
                                    ? current.filter((id: string) => id !== customer.username)
                                    : [...current, customer.username];
                                  setEditingSurvey({ ...editingSurvey, targetValue: next });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  (editingSurvey.targetValue || []).includes(customer.username)
                                    ? 'bg-tuplato text-white border-tuplato' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {customer.name}
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 font-medium py-4 w-full text-center">No se encontraron clientes</p>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3">Selecciona uno o varios clientes de la lista.</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="flex items-center gap-3 cursor-pointer group bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-tuplato/30 transition-all">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${editingSurvey.isActive ? 'bg-tuplato border-tuplato' : 'bg-white border-gray-300'}`}>
                        {editingSurvey.isActive && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <input 
                        type="checkbox"
                        checked={editingSurvey.isActive}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, isActive: e.target.checked })}
                        className="hidden"
                      />
                      <span className="text-sm font-bold text-gray-700">Publicar encuesta inmediatamente</span>
                    </label>
                  </div>
                </section>

                {/* Questions Builder Section */}
                <section className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-tuplato rounded-full" />
                      <h4 className="font-black text-gray-900 uppercase tracking-wider text-sm">Constructor de Preguntas</h4>
                    </div>
                    <Button onClick={addQuestion} variant="secondary" size="sm" className="rounded-xl font-bold bg-gray-100 hover:bg-gray-200 border-none text-gray-700">
                      <Plus className="w-4 h-4 mr-1" /> Añadir Pregunta
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {editingSurvey.questions?.map((question, index) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={question.id} 
                        className="p-6 bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm space-y-6 relative group/question"
                      >
                        <div className="absolute -left-3 top-6 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                          {index + 1}
                        </div>
                        
                        <div className="flex justify-between items-start gap-4 pl-4">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Texto de la Pregunta</label>
                            <Input 
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                              placeholder={`Ej: ¿Qué tal estuvo el servicio?`}
                              className="rounded-xl border-gray-100 bg-gray-50/50 h-12 font-bold focus:bg-white transition-all"
                            />
                          </div>
                          <button 
                            onClick={() => removeQuestion(question.id)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all mt-6"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="pl-4">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Formato de Respuesta</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'rating', icon: Star, label: 'Estrellas' },
                              { id: 'text', icon: Type, label: 'Texto Libre' },
                              { id: 'multiple_choice', icon: List, label: 'Opciones' }
                            ].map((type) => (
                              <button
                                key={type.id}
                                onClick={() => updateQuestion(question.id, { type: type.id as any })}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                  question.type === type.id 
                                    ? 'bg-tuplato text-white border-tuplato shadow-lg shadow-tuplato/20' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {question.type === 'multiple_choice' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pl-4 space-y-4"
                          >
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Opciones de Respuesta</label>
                            <div className="grid gap-3">
                              {(question.options || ['']).map((opt, optIdx) => (
                                <div key={optIdx} className="flex gap-2">
                                  <Input 
                                    value={opt}
                                    onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                    placeholder={`Opción ${optIdx + 1}`}
                                    className="rounded-xl border-gray-100 bg-gray-50/50 h-12 font-medium"
                                  />
                                  <button 
                                    onClick={() => removeOption(question.id, optIdx)}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button 
                                onClick={() => addOption(question.id)}
                                className="flex items-center gap-2 text-tuplato font-black text-xs hover:bg-tuplato/5 w-fit px-4 py-2 rounded-xl transition-all"
                              >
                                <Plus className="w-4 h-4" />
                                Añadir Opción
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                    
                    {editingSurvey.questions?.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold text-sm">Aún no has añadido preguntas</p>
                        <button onClick={addQuestion} className="text-tuplato text-sm font-black mt-2 hover:underline">Haz clic para añadir la primera</button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Mobile Actions - Visible only on small screens, scrolls with content */}
                <div className="sm:hidden pt-6 flex flex-col gap-3">
                  <Button 
                    onClick={handleSaveSurvey} 
                    disabled={!editingSurvey.title || editingSurvey.questions?.length === 0}
                    className="rounded-2xl w-full py-4 font-black bg-tuplato text-white shadow-lg shadow-tuplato/20"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {editingSurvey.id ? 'Actualizar Encuesta' : 'Publicar Encuesta'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsModalOpen(false)} 
                    className="rounded-2xl w-full py-4 font-bold bg-gray-100 text-gray-500 border-none"
                  >
                    Descartar
                  </Button>
                </div>
              </div>

              {/* Desktop Footer - Sticky at the bottom, hidden on mobile */}
              <div className="hidden sm:flex p-8 bg-gray-50/80 backdrop-blur-sm justify-end gap-4 sticky bottom-0 border-t border-gray-100 shrink-0">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="rounded-2xl px-8 py-6 font-bold border-none bg-white text-gray-500 hover:bg-gray-100">
                  Descartar
                </Button>
                <Button 
                  onClick={handleSaveSurvey} 
                  disabled={!editingSurvey.title || editingSurvey.questions?.length === 0}
                  className="rounded-2xl px-10 py-6 font-black bg-tuplato text-white hover:bg-tuplato-dark shadow-xl shadow-tuplato/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {editingSurvey.id ? 'Actualizar Encuesta' : 'Publicar Encuesta'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
