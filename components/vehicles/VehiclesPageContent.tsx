'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface VehiclesPageContentProps {
  agencyId: string;
  agencyName: string;
}

interface Vehicle {
  id: string;
  registration: string;
  model: string;
  type: string;
  mileage: number;
  status: 'in_service' | 'maintenance' | 'out_of_service';
  assignedTo?: string;
  notes?: string;
}

export function VehiclesPageContent({ agencyId, agencyName }: VehiclesPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const storageKey = `vehicles_${agencyId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setVehicles(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    }
  }, [agencyId]);

  useEffect(() => {
    const storageKey = `vehicles_${agencyId}`;
    localStorage.setItem(storageKey, JSON.stringify(vehicles));
  }, [vehicles, agencyId]);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: vehicles.length,
    inService: vehicles.filter(v => v.status === 'in_service').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    outOfService: vehicles.filter(v => v.status === 'out_of_service').length,
  };

  const handleAddVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    const vehicle: Vehicle = {
      ...newVehicle,
      id: Date.now().toString(),
    };
    setVehicles([...vehicles, vehicle]);
    setShowAddModal(false);
  };

  const handleEditVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    setShowEditModal(false);
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
      setShowViewModal(false);
      setSelectedVehicle(null);
    }
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    const badges = {
      in_service: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'En service' },
      maintenance: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Wrench, label: 'Maintenance' },
      out_of_service: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Hors service' },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Véhicules de Service</h1>
          <p className="text-gray-400">Gestion du parc automobile - {agencyName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un véhicule
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Véhicules</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En service</p>
              <p className="text-3xl font-bold text-white">{stats.inService}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En maintenance</p>
              <p className="text-3xl font-bold text-white">{stats.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Hors service</p>
              <p className="text-3xl font-bold text-white">{stats.outOfService}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par immatriculation, modèle, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">Immatriculation</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Modèle</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Kilométrage</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Assigné à</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <Car className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucun véhicule trouvé' : 'Aucun véhicule créé'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{vehicle.registration}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{vehicle.model}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{vehicle.type}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{vehicle.mileage.toLocaleString()} km</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{vehicle.assignedTo || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
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

      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddVehicle}
        />
      )}

      {showViewModal && selectedVehicle && (
        <ViewVehicleModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowViewModal(false);
            setSelectedVehicle(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteVehicle(selectedVehicle.id)}
        />
      )}

      {showEditModal && selectedVehicle && (
        <EditVehicleModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVehicle(null);
          }}
          onSave={handleEditVehicle}
        />
      )}
    </div>
  );
}

function AddVehicleModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (vehicle: Omit<Vehicle, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    registration: '',
    model: '',
    type: 'Sedan',
    mileage: 0,
    status: 'in_service' as Vehicle['status'],
    assignedTo: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Ajouter un véhicule" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Immatriculation *</label>
            <input
              type="text"
              required
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="AB-123-CD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Modèle *</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Ford Crown Victoria"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option>Sedan</option>
              <option>SUV</option>
              <option>Moto</option>
              <option>Van</option>
              <option>Camion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kilométrage *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="in_service">En service</option>
              <option value="maintenance">En maintenance</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assigné à</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Agent #123"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewVehicleModal({
  vehicle,
  onClose,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Vehicle['status']) => {
    const badges = {
      in_service: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'En service' },
      maintenance: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Wrench, label: 'Maintenance' },
      out_of_service: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Hors service' },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Détails du véhicule" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Immatriculation</label>
            <p className="text-white font-medium">{vehicle.registration}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Modèle</label>
            <p className="text-white font-medium">{vehicle.model}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <p className="text-white">{vehicle.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Kilométrage</label>
            <p className="text-white">{vehicle.mileage.toLocaleString()} km</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(vehicle.status)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Assigné à</label>
            <p className="text-white">{vehicle.assignedTo || 'Non assigné'}</p>
          </div>
        </div>

        {vehicle.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{vehicle.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EditVehicleModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}) {
  const [formData, setFormData] = useState(vehicle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier le véhicule" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Immatriculation *</label>
            <input
              type="text"
              required
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Modèle *</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option>Sedan</option>
              <option>SUV</option>
              <option>Moto</option>
              <option>Van</option>
              <option>Camion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kilométrage *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="in_service">En service</option>
              <option value="maintenance">En maintenance</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assigné à</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
