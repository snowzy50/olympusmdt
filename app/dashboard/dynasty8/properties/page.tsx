'use client';

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
} from 'lucide-react';

/**
 * Module de gestion des propriétés immobilières
 * Créé par Snowzy
 */

interface Property {
  id: string;
  propertyNumber: string;
  type: 'house' | 'apartment' | 'commercial';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'rented' | 'sold';
  price: number;
  rentPrice?: number;
  surface: number;
  rooms: number;
  owner?: string;
  tenant?: string;
  agent: string;
  agentId: string;
  description: string;
  features: string[];
}

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

  // Données de démonstration
  const [properties] = useState<Property[]>([
    {
      id: '1',
      propertyNumber: 'PROP-2024-001',
      type: 'house',
      address: '123 Vinewood Hills, Los Santos',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      status: 'available',
      price: 850000,
      surface: 250,
      rooms: 5,
      agent: 'Sarah Johnson',
      agentId: 'DYN-1234',
      description: 'Magnifique villa avec vue panoramique sur la ville',
      features: ['Piscine', 'Garage 2 places', 'Jardin', 'Vue mer'],
    },
    {
      id: '2',
      propertyNumber: 'PROP-2024-002',
      type: 'apartment',
      address: '456 Downtown Apt 12B, Los Santos',
      coordinates: { lat: 34.0489, lng: -118.2500 },
      status: 'rented',
      price: 320000,
      rentPrice: 1500,
      surface: 85,
      rooms: 3,
      tenant: 'Michael Brown',
      agent: 'John Smith',
      agentId: 'DYN-5678',
      description: 'Appartement moderne en centre-ville',
      features: ['Balcon', 'Parking souterrain', 'Ascenseur'],
    },
    {
      id: '3',
      propertyNumber: 'PROP-2024-003',
      type: 'commercial',
      address: '789 Business District, Los Santos',
      coordinates: { lat: 34.0450, lng: -118.2550 },
      status: 'sold',
      price: 1200000,
      surface: 180,
      rooms: 0,
      owner: 'Tech Corp Inc.',
      agent: 'Emily Davis',
      agentId: 'DYN-9012',
      description: 'Local commercial stratégiquement situé',
      features: ['Vitrine', 'Bureau', 'Stockage', 'Accès handicapé'],
    },
  ]);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || property.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const totalRentIncome = properties
    .filter((p) => p.status === 'rented' && p.rentPrice)
    .reduce((sum, p) => sum + (p.rentPrice || 0), 0);

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
          <Button variant="primary" className="gap-2">
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
                          <span>{property.propertyNumber}</span>
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
                        {property.rentPrice && (
                          <div>
                            <p className="text-gray-400">Loyer hebdomadaire</p>
                            <p className="text-warning-500 font-bold text-lg">
                              ${property.rentPrice.toLocaleString()}
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
                            {property.agent} ({property.agentId})
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
                    <Button variant="outline" size="sm" className="gap-2">
                      <MapPin className="w-4 h-4" />
                      Carte
                    </Button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-400" />
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
    </div>
  );
}
