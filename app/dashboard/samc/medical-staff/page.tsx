'use client';

// Page de gestion du Personnel de santé pour SAMC
// Créé par Snowzy

import { useState, useMemo } from 'react';
import { useSupabaseMedicalStaff } from '@/hooks/useSupabaseMedicalStaff';
import type { MedicalStaff, MedicalStaffInsert } from '@/lib/supabase/client';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX, Users, Activity, Eye, X } from 'lucide-react';

type StaffRole = 'doctor' | 'nurse' | 'paramedic' | 'surgeon' | 'specialist' | 'intern' | 'admin';
type StaffAvailability = 'available' | 'on_call' | 'busy' | 'off_duty';
type StaffStatus = 'active' | 'on_leave' | 'suspended' | 'inactive';

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'doctor', label: 'Médecin' },
  { value: 'surgeon', label: 'Chirurgien' },
  { value: 'specialist', label: 'Spécialiste' },
  { value: 'nurse', label: 'Infirmier(ère)' },
  { value: 'paramedic', label: 'Ambulancier' },
  { value: 'intern', label: 'Interne' },
  { value: 'admin', label: 'Administratif' },
];

const AVAILABILITY_OPTIONS: { value: StaffAvailability; label: string; color: string }[] = [
  { value: 'available', label: 'Disponible', color: 'text-success-500 bg-success-500/10' },
  { value: 'on_call', label: 'Astreinte', color: 'text-info-500 bg-info-500/10' },
  { value: 'busy', label: 'Occupé', color: 'text-warning-500 bg-warning-500/10' },
  { value: 'off_duty', label: 'Hors service', color: 'text-gray-500 bg-gray-500/10' },
];

const STATUS_OPTIONS: { value: StaffStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Actif', color: 'text-success-500 bg-success-500/10' },
  { value: 'on_leave', label: 'En congé', color: 'text-warning-500 bg-warning-500/10' },
  { value: 'suspended', label: 'Suspendu', color: 'text-error-500 bg-error-500/10' },
  { value: 'inactive', label: 'Inactif', color: 'text-gray-500 bg-gray-500/10' },
];

export default function MedicalStaffPage() {
  const { medicalStaff, loading, error, addMedicalStaff, updateMedicalStaff, deleteMedicalStaff } = useSupabaseMedicalStaff();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<StaffRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<StaffStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<MedicalStaff | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalStaffInsert>>({
    staff_number: '',
    first_name: '',
    last_name: '',
    role: 'doctor',
    specialty: '',
    grade: '',
    license_number: '',
    phone: '',
    email: '',
    service_hours: 0,
    availability: 'off_duty',
    status: 'active',
    notes: '',
  });

  const filteredStaff = useMemo(() => {
    return medicalStaff.filter((staff) => {
      const matchesSearch =
        staff.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.staff_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.specialty && staff.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = filterRole === 'all' || staff.role === filterRole;
      const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [medicalStaff, searchTerm, filterRole, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: medicalStaff.length,
      active: medicalStaff.filter((s) => s.status === 'active').length,
      available: medicalStaff.filter((s) => s.availability === 'available').length,
      doctors: medicalStaff.filter((s) => s.role === 'doctor' || s.role === 'surgeon' || s.role === 'specialist').length,
    };
  }, [medicalStaff]);

  const resetForm = () => {
    setFormData({
      staff_number: '',
      first_name: '',
      last_name: '',
      role: 'doctor',
      specialty: '',
      grade: '',
      license_number: '',
      phone: '',
      email: '',
      service_hours: 0,
      availability: 'off_duty',
      status: 'active',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffData: MedicalStaffInsert = {
      ...formData as MedicalStaffInsert,
      staff_number: `MS-${new Date().getFullYear()}-${String(medicalStaff.length + 1).padStart(3, '0')}`,
    };

    const result = await addMedicalStaff(staffData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const result = await updateMedicalStaff(selectedStaff.id, formData);
    if (result) {
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      await deleteMedicalStaff(id);
    }
  };

  const openEditModal = (staff: MedicalStaff) => {
    setSelectedStaff(staff);
    setFormData({
      staff_number: staff.staff_number,
      first_name: staff.first_name,
      last_name: staff.last_name,
      role: staff.role,
      specialty: staff.specialty || '',
      grade: staff.grade || '',
      license_number: staff.license_number || '',
      phone: staff.phone || '',
      email: staff.email || '',
      service_hours: staff.service_hours,
      availability: staff.availability,
      status: staff.status,
      notes: staff.notes || '',
    });
    setShowEditModal(true);
  };

  const getAvailabilityStyle = (availability: StaffAvailability) => {
    return AVAILABILITY_OPTIONS.find((opt) => opt.value === availability)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getStatusStyle = (status: StaffStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getRoleLabel = (role: StaffRole) => {
    return ROLE_OPTIONS.find((opt) => opt.value === role)?.label || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agencies-samc-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-500/10 border border-error-500 rounded-lg">
        <p className="text-error-500">Erreur: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Personnel de Santé</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-agencies-samc-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actifs</p>
                <p className="text-2xl font-bold text-success-500">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Disponibles</p>
                <p className="text-2xl font-bold text-info-500">{stats.available}</p>
              </div>
              <Activity className="w-8 h-8 text-info-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Médecins</p>
                <p className="text-2xl font-bold text-agencies-samc-500">{stats.doctors}</p>
              </div>
              <UserCheck className="w-8 h-8 text-agencies-samc-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-strong p-4 rounded-lg border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-agencies-samc-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as StaffRole | 'all')}
              className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
            >
              <option value="all">Tous les rôles</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StaffStatus | 'all')}
              className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
            >
              <option value="all">Tous les statuts</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau membre
            </button>
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-200 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Matricule</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Nom</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Rôle</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Spécialité</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Disponibilité</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Aucun membre du personnel trouvé
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{staff.staff_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{staff.first_name} {staff.last_name}</div>
                        {staff.grade && <div className="text-gray-400 text-sm">{staff.grade}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{getRoleLabel(staff.role)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{staff.specialty || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityStyle(staff.availability)}`}>
                        {AVAILABILITY_OPTIONS.find((opt) => opt.value === staff.availability)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(staff.status)}`}>
                        {STATUS_OPTIONS.find((opt) => opt.value === staff.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStaff(staff);
                            setShowViewModal(true);
                          }}
                          className="text-info-500 hover:text-info-400 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(staff)}
                          className="text-warning-500 hover:text-warning-400 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="text-error-500 hover:text-error-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nouveau membre du personnel</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rôle *</label>
                  <select
                    required
                    value={formData.role || 'doctor'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spécialité</label>
                  <input
                    type="text"
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="Urgentiste, Chirurgien..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
                  <input
                    type="text"
                    value={formData.grade || ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="Junior, Senior..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de licence</label>
                  <input
                    type="text"
                    value={formData.license_number || ''}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Disponibilité *</label>
                  <select
                    required
                    value={formData.availability || 'off_duty'}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as StaffAvailability })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition - Similaire à la modal de création */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier le personnel</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedStaff(null); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {/* Même formulaire que la création */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rôle *</label>
                  <select
                    required
                    value={formData.role || 'doctor'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spécialité</label>
                  <input
                    type="text"
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
                  <input
                    type="text"
                    value={formData.grade || ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Disponibilité *</label>
                  <select
                    required
                    value={formData.availability || 'off_duty'}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as StaffAvailability })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedStaff(null); resetForm(); }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails du personnel</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedStaff(null); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Matricule</p>
                  <p className="text-white font-medium">{selectedStaff.staff_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Nom complet</p>
                  <p className="text-white">{selectedStaff.first_name} {selectedStaff.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rôle</p>
                  <p className="text-white">{getRoleLabel(selectedStaff.role)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Spécialité</p>
                  <p className="text-white">{selectedStaff.specialty || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Grade</p>
                  <p className="text-white">{selectedStaff.grade || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Licence</p>
                  <p className="text-white">{selectedStaff.license_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Téléphone</p>
                  <p className="text-white">{selectedStaff.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white">{selectedStaff.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Heures de service</p>
                  <p className="text-white">{selectedStaff.service_hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Disponibilité</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityStyle(selectedStaff.availability)}`}>
                    {AVAILABILITY_OPTIONS.find((opt) => opt.value === selectedStaff.availability)?.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedStaff.status)}`}>
                    {STATUS_OPTIONS.find((opt) => opt.value === selectedStaff.status)?.label}
                  </span>
                </div>
              </div>

              {selectedStaff.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedStaff.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>Créé le: {new Date(selectedStaff.created_at).toLocaleString('fr-FR')}</p>
                <p>Modifié le: {new Date(selectedStaff.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-200 px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedStaff(null); }}
                className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
