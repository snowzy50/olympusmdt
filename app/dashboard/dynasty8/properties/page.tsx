'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  Home,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Map,
  Filter,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useSupabaseProperties } from '@/hooks/useSupabaseProperties';
import type { Property, PropertyInsert } from '@/lib/supabase/client';

/**
 * Module de gestion des propriétés immobilières
 * Créé par Snowzy
 */

const propertyTypeLabels: Record<string, { label: string; color: string }> = {
  house: { label: 'Maison', color: 'success' },
  apartment: { label: 'Appartement', color: 'info' },
  commercial: { label: 'Local commercial', color: 'warning' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'success' },
  rented: { label: 'Loué', color: 'warning' },
  sold: { label: 'Vendu', color: 'error' },
};

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PropertyInsert>>({
    type: 'house',
    address: '',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    status: 'available',
    price: 0,
    surface: 0,
    rooms: 0,
    agent: '',
    agent_id: '',
    description: '',
    features: [],
    property_number: '',
  });

  // Hook Supabase
  const { properties, isLoading, error, addProperty, updateProperty, deleteProperty } = useSupabaseProperties();

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.property_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || property.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const totalRentIncome = properties
    .filter((p) => p.status === 'rented' && p.rent_price)
    .reduce((sum, p) => sum + (p.rent_price || 0), 0);

  // Handlers
  const handleCreate = () => {
    setEditingProperty(null);
    setFormData({
      type: 'house',
      address: '',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      status: 'available',
      price: 0,
      surface: 0,
      rooms: 0,
      agent: '',
      agent_id: '',
      description: '',
      features: [],
      property_number: '',
    });
    setShowModal(true);
  };

  const handleView = (property: Property) => {
    setViewingProperty(property);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData(property);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteProperty(deletingId);
      if (success) {
        setShowDeleteConfirm(false);
        setDeletingId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      await updateProperty(editingProperty.id, formData);
    } else {
      const propertyData: PropertyInsert = {
        property_number: `PROP-${new Date().getFullYear()}-${String(properties.length + 1).padStart(3, '0')}`,
        ...formData as PropertyInsert,
      };
      await addProperty(propertyData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Parc immobilier</h1>
          <p className="text-gray-400">
            Gestion des propriétés avec carte interactive
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={showMap ? 'primary' : 'outline'}
            className="gap-2"
            onClick={() => setShowMap(!showMap)}
          >
            <Map className="w-4 h-4" />
            {showMap ? 'Voir la liste' : 'Carte interactive'}
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nouvelle propriété
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <Home className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Disponibles</p>
              <p className="text-2xl font-bold text-white">
                {properties.filter((p) => p.status === 'available').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <Home className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Loués</p>
              <p className="text-2xl font-bold text-white">
                {properties.filter((p) => p.status === 'rented').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valeur totale</p>
              <p className="text-2xl font-bold text-white">
                ${(totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenu locatif/mois</p>
              <p className="text-2xl font-bold text-white">
                ${totalRentIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une propriété..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <option value="all">Tous les types</option>
            <option value="house">Maisons</option>
            <option value="apartment">Appartements</option>
            <option value="commercial">Locaux commerciaux</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponibles</option>
            <option value="rented">Loués</option>
            <option value="sold">Vendus</option>
          </select>
        </div>
      </Card>

      {/* Map or List View */}
      {showMap ? (
        <Card className="p-8">
          <div className="bg-gray-800/50 rounded-lg p-12 text-center">
            <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Carte interactive
            </h3>
            <p className="text-gray-400 mb-4">
              Intégration de la carte interactive en cours de développement
            </p>
            <p className="text-sm text-gray-500">
              Affichera toutes les propriétés avec des marqueurs interactifs
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => {
            const typeInfo = propertyTypeLabels[property.type];
            const statusInfo = statusLabels[property.status];

            return (
              <Card
                key={property.id}
                className="p-6 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="p-3 bg-success-500/10 rounded-lg">
                      <Home className="w-6 h-6 text-success-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {property.address}
                          </h3>
                          <Badge variant={typeInfo.color as any}>
                            {typeInfo.label}
                          </Badge>
                          <Badge variant={statusInfo.color as any}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span>{property.property_number}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.coordinates.lat.toFixed(4)},{' '}
                            {property.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{property.description}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Prix de vente</p>
                          <p className="text-success-500 font-bold text-lg">
                            ${property.price.toLocaleString()}
                          </p>
                        </div>
                        {property.rent_price && (
                          <div>
                            <p className="text-gray-400">Loyer hebdomadaire</p>
                            <p className="text-warning-500 font-bold text-lg">
                              ${property.rent_price.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-400">Surface</p>
                          <p className="text-white font-medium">
                            {property.surface}m²
                          </p>
                        </div>
                        {property.rooms > 0 && (
                          <div>
                            <p className="text-gray-400">Pièces</p>
                            <p className="text-white font-medium">
                              {property.rooms} pièces
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {property.features.map((feature, idx) => (
                          <Badge key={idx} variant="info">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-700">
                        <div>
                          <p className="text-gray-400">Agent responsable</p>
                          <p className="text-white font-medium">
                            {property.agent} ({property.agent_id})
                          </p>
                        </div>
                        {property.tenant && (
                          <div>
                            <p className="text-gray-400">Locataire actuel</p>
                            <p className="text-white font-medium">
                              {property.tenant}
                            </p>
                          </div>
                        )}
                        {property.owner && (
                          <div>
                            <p className="text-gray-400">Propriétaire</p>
                            <p className="text-white font-medium">
                              {property.owner}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleView(property)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleEdit(property)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-error-500" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredProperties.length === 0 && (
            <Card className="p-12 text-center">
              <Home className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune propriété trouvée</p>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProperty ? 'Modifier la propriété' : 'Nouvelle propriété'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de propriété
                  </label>
                  <select
                    value={formData.type || 'house'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  >
                    <option value="house">Maison</option>
                    <option value="apartment">Appartement</option>
                    <option value="commercial">Local commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status || 'available'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  >
                    <option value="available">Disponible</option>
                    <option value="rented">Loué</option>
                    <option value="sold">Vendu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix de vente ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.surface || 0}
                    onChange={(e) => setFormData({ ...formData, surface: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pièces
                  </label>
                  <input
                    type="number"
                    value={formData.rooms || 0}
                    onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Loyer hebdomadaire ($ - optionnel)
                </label>
                <input
                  type="number"
                  value={formData.rent_price || ''}
                  onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent responsable
                  </label>
                  <input
                    type="text"
                    value={formData.agent || ''}
                    onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Agent (Dynasty8)
                  </label>
                  <input
                    type="text"
                    value={formData.agent_id || ''}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.coordinates?.lat || 34.0522}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: {
                        lat: parseFloat(e.target.value),
                        lng: formData.coordinates?.lng || -118.2437
                      }
                    })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.coordinates?.lng || -118.2437}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: {
                        lat: formData.coordinates?.lat || 34.0522,
                        lng: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingProperty ? 'Modifier' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Détails de la propriété</h2>
              <button
                onClick={() => setViewingProperty(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header with badges */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {viewingProperty.address}
                  </h3>
                  <Badge variant={propertyTypeLabels[viewingProperty.type].color as any}>
                    {propertyTypeLabels[viewingProperty.type].label}
                  </Badge>
                  <Badge variant={statusLabels[viewingProperty.status].color as any}>
                    {statusLabels[viewingProperty.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{viewingProperty.propertyNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {viewingProperty.coordinates.lat.toFixed(4)}, {viewingProperty.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-white">{viewingProperty.description}</p>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Prix de vente</p>
                  <p className="text-success-500 font-bold text-2xl">
                    ${viewingProperty.price.toLocaleString()}
                  </p>
                </div>
                {viewingProperty.rentPrice && (
                  <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Loyer hebdomadaire</p>
                    <p className="text-warning-500 font-bold text-2xl">
                      ${viewingProperty.rentPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Surface</p>
                  <p className="text-white font-medium">{viewingProperty.surface}m²</p>
                </div>
                {viewingProperty.rooms > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Pièces</p>
                    <p className="text-white font-medium">{viewingProperty.rooms} pièces</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Agent responsable</p>
                  <p className="text-white font-medium">
                    {viewingProperty.agent} ({viewingProperty.agentId})
                  </p>
                </div>
              </div>

              {/* Tenant/Owner */}
              {(viewingProperty.tenant || viewingProperty.owner) && (
                <div className="grid grid-cols-2 gap-6">
                  {viewingProperty.tenant && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Locataire actuel</p>
                      <p className="text-white font-medium">{viewingProperty.tenant}</p>
                    </div>
                  )}
                  {viewingProperty.owner && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Propriétaire</p>
                      <p className="text-white font-medium">{viewingProperty.owner}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              {viewingProperty.features.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-3">Caractéristiques</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {viewingProperty.features.map((feature, idx) => (
                      <Badge key={idx} variant="info">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  setViewingProperty(null);
                  handleEdit(viewingProperty);
                }}
                className="flex-1"
              >
                Modifier
              </Button>
              <Button
                variant="secondary"
                onClick={() => setViewingProperty(null)}
                className="flex-1"
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-error-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-error-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Confirmer la suppression</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer cette propriété ? Toutes les informations
              associées seront définitivement perdues.
            </p>

            <div className="flex gap-3">
              <Button variant="danger" onClick={confirmDelete} className="flex-1">
                Supprimer
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
