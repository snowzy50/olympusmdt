'use client';

import React, { useState, useMemo } from 'react';
import { useSupabaseOnDutySchedule } from '@/hooks/useSupabaseOnDutySchedule';
import type { OnDutyScheduleInsert, OnDutyScheduleUpdate } from '@/lib/supabase/client';
import {
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Clock,
  Users,
  UserCheck,
  Activity
} from 'lucide-react';

export default function OnDutySchedulePage() {
  const { onDutySchedules, loading, createOnDutySchedule, updateOnDutySchedule, deleteOnDutySchedule } = useSupabaseOnDutySchedule();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<OnDutyScheduleInsert>>({
    schedule_date: '',
    shift_type: 'morning',
    staff_name: '',
    staff_id: '',
    role: '',
    start_time: '',
    end_time: '',
    location: '',
    on_call: false,
    notes: '',
  });

  // Statistiques
  const stats = useMemo(() => {
    const total = onDutySchedules.length;
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = onDutySchedules.filter(s => s.schedule_date === today).length;
    const onCall = onDutySchedules.filter(s => s.on_call && s.schedule_date >= today).length;
    const uniqueStaff = new Set(onDutySchedules.map(s => s.staff_id)).size;

    return { total, todaySchedules, onCall, uniqueStaff };
  }, [onDutySchedules]);

  // Filtrage et recherche
  const filteredSchedules = useMemo(() => {
    return onDutySchedules.filter(schedule => {
      const matchesSearch =
        schedule.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesShift = shiftFilter === 'all' || schedule.shift_type === shiftFilter;

      return matchesSearch && matchesShift;
    });
  }, [onDutySchedules, searchTerm, shiftFilter]);

  const resetForm = () => {
    setFormData({
      schedule_date: '',
      shift_type: 'morning',
      staff_name: '',
      staff_id: '',
      role: '',
      start_time: '',
      end_time: '',
      location: '',
      on_call: false,
      notes: '',
    });
  };

  const handleCreate = () => {
    setShowCreateModal(true);
    resetForm();
  };

  const handleEdit = (schedule: any) => {
    setSelectedSchedule(schedule);
    setFormData({
      schedule_date: schedule.schedule_date || '',
      shift_type: schedule.shift_type || 'morning',
      staff_name: schedule.staff_name || '',
      staff_id: schedule.staff_id || '',
      role: schedule.role || '',
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      location: schedule.location || '',
      on_call: schedule.on_call || false,
      notes: schedule.notes || '',
    });
    setShowEditModal(true);
  };

  const handleView = (schedule: any) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette garde ?')) {
      await deleteOnDutySchedule(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleData: OnDutyScheduleInsert = formData as OnDutyScheduleInsert;
    await createOnDutySchedule(scheduleData);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule) return;

    const updateData: OnDutyScheduleUpdate = formData;
    await updateOnDutySchedule(selectedSchedule.id, updateData);
    setShowEditModal(false);
    setSelectedSchedule(null);
    resetForm();
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'text-warning-500 bg-warning-500/10 border-warning-500/30';
      case 'afternoon': return 'text-info-500 bg-info-500/10 border-info-500/30';
      case 'night': return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
      case 'full_day': return 'text-agencies-samc-500 bg-agencies-samc-500/10 border-agencies-samc-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case 'morning': return 'Matin';
      case 'afternoon': return 'Après-midi';
      case 'night': return 'Nuit';
      case 'full_day': return 'Journée complète';
      default: return shift;
    }
  };

  const isUpcoming = (date: string) => {
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduleDate >= today;
  };

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planning des gardes</h1>
          <p className="text-gray-400">Gestion des horaires et affectations du personnel médical</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Garde
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total des gardes</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-agencies-samc-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-agencies-samc-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Gardes aujourd&apos;hui</p>
              <p className="text-3xl font-bold text-info-500">{stats.todaySchedules}</p>
            </div>
            <div className="p-3 bg-info-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-info-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Personnel d&apos;astreinte</p>
              <p className="text-3xl font-bold text-warning-500">{stats.onCall}</p>
            </div>
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Personnel affecté</p>
              <p className="text-3xl font-bold text-success-500">{stats.uniqueStaff}</p>
            </div>
            <div className="p-3 bg-success-500/10 rounded-lg">
              <Users className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="glass-strong p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, rôle, lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
          />
        </div>

        <select
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
        >
          <option value="all">Toutes les périodes</option>
          <option value="morning">Matin</option>
          <option value="afternoon">Après-midi</option>
          <option value="night">Nuit</option>
          <option value="full_day">Journée complète</option>
        </select>
      </div>

      {/* Tableau des gardes */}
      <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Période</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Personnel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Horaires</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Lieu</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Astreinte</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucune garde trouvée
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!isUpcoming(schedule.schedule_date) ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">
                          {new Date(schedule.schedule_date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getShiftColor(schedule.shift_type)}`}>
                        {getShiftLabel(schedule.shift_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white">{schedule.staff_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{schedule.staff_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {schedule.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {schedule.location}
                    </td>
                    <td className="px-6 py-4">
                      {schedule.on_call ? (
                        <div className="flex items-center gap-1 text-warning-500">
                          <UserCheck className="w-4 h-4" />
                          <span className="text-xs">Oui</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Non</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(schedule)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-info-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-agencies-samc-500"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-error-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nouvelle Garde</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.schedule_date}
                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Période *
                  </label>
                  <select
                    required
                    value={formData.shift_type}
                    onChange={(e) => setFormData({ ...formData, shift_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="morning">Matin</option>
                    <option value="afternoon">Après-midi</option>
                    <option value="night">Nuit</option>
                    <option value="full_day">Journée complète</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du personnel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staff_name}
                    onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                    placeholder="Prénom Nom"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du personnel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    placeholder="Ex: M123456"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Ex: Médecin, Infirmier..."
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Urgences, Chirurgie..."
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de fin *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="on_call"
                  checked={formData.on_call || false}
                  onChange={(e) => setFormData({ ...formData, on_call: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-dark-100 text-agencies-samc-500"
                />
                <label htmlFor="on_call" className="text-sm text-gray-300">
                  Personnel d&apos;astreinte
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations additionnelles..."
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-300 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Créer la garde
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier la Garde</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.schedule_date}
                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Période
                  </label>
                  <select
                    value={formData.shift_type}
                    onChange={(e) => setFormData({ ...formData, shift_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="morning">Matin</option>
                    <option value="afternoon">Après-midi</option>
                    <option value="night">Nuit</option>
                    <option value="full_day">Journée complète</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du personnel
                  </label>
                  <input
                    type="text"
                    value={formData.staff_name}
                    onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du personnel
                  </label>
                  <input
                    type="text"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="on_call_edit"
                  checked={formData.on_call || false}
                  onChange={(e) => setFormData({ ...formData, on_call: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-dark-100 text-agencies-samc-500"
                />
                <label htmlFor="on_call_edit" className="text-sm text-gray-300">
                  Personnel d&apos;astreinte
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSchedule(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-300 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualisation */}
      {showViewModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de la Garde</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSchedule(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white">
                    {new Date(selectedSchedule.schedule_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Période</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getShiftColor(selectedSchedule.shift_type)}`}>
                    {getShiftLabel(selectedSchedule.shift_type)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Personnel</p>
                  <p className="text-white">{selectedSchedule.staff_name}</p>
                  <p className="text-gray-500 text-sm font-mono">{selectedSchedule.staff_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Rôle</p>
                  <p className="text-white">{selectedSchedule.role}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Horaires</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-white">
                      {selectedSchedule.start_time} - {selectedSchedule.end_time}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Lieu</p>
                  <p className="text-white">{selectedSchedule.location}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Astreinte</p>
                  {selectedSchedule.on_call ? (
                    <div className="flex items-center gap-1 text-warning-500">
                      <UserCheck className="w-5 h-5" />
                      <span>Oui</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Non</span>
                  )}
                </div>
              </div>

              {selectedSchedule.notes && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedSchedule.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSchedule(null);
                  }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-300 text-white rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
