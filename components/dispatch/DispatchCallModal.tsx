/**
 * Modal pour créer/éditer/visualiser un appel dispatch
 * Créé par: Snowzy
 * Features: Upload image, formulaire complet, validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Save,
  Trash2,
  Edit2,
} from 'lucide-react';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import { formatDateParis, formatTimeParis } from '@/lib/dateUtils';

interface DispatchCallModalProps {
  call?: DispatchCall | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Partial<DispatchCall>) => void;
  onDelete?: (call: DispatchCall) => void;
  initialLocation?: { lat: number; lng: number };
  mode?: 'view' | 'create' | 'edit';
}

const callTypes = [
  { value: 'robbery', label: 'Vol à main armée', icon: '🏦' },
  { value: 'medical', label: 'Urgence médicale', icon: '🚑' },
  { value: 'traffic', label: 'Accident de la route', icon: '🚗' },
  { value: 'assault', label: 'Agression', icon: '👊' },
  { value: 'fire', label: 'Incendie', icon: '🔥' },
  { value: 'pursuit', label: 'Poursuite', icon: '🚔' },
  { value: 'suspicious', label: 'Activité suspecte', icon: '🔍' },
  { value: 'backup', label: 'Demande de renfort', icon: '👮' },
  { value: 'other', label: 'Autre', icon: '📍' },
] as const;

const priorities = [
  { value: 'code1', label: 'Code 1 - Urgence', color: 'bg-red-500' },
  { value: 'code2', label: 'Code 2 - Normal', color: 'bg-orange-500' },
  { value: 'code3', label: 'Code 3 - Non-urgent', color: 'bg-blue-500' },
] as const;

const statuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'dispatched', label: 'Assigné' },
  { value: 'en_route', label: 'En route' },
  { value: 'on_scene', label: 'Sur place' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'cancelled', label: 'Annulé' },
] as const;

export function DispatchCallModal({
  call,
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialLocation,
  mode = 'view',
}: DispatchCallModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [imagePreview, setImagePreview] = useState<string | null>(call?.image_url || null);

  // Form state
  const [formData, setFormData] = useState({
    title: call?.title || '',
    description: call?.description || '',
    call_type: call?.call_type || 'other',
    priority: call?.priority || 'code2',
    status: call?.status || 'pending',
    location: call?.location || initialLocation || { lat: 0, lng: 0, address: '' },
    image_url: call?.image_url || '',
    notes: call?.notes || '',
  });

  useEffect(() => {
    if (call) {
      setFormData({
        title: call.title,
        description: call.description || '',
        call_type: call.call_type,
        priority: call.priority,
        status: call.status,
        location: call.location,
        image_url: call.image_url || '',
        notes: call.notes || '',
      });
      setImagePreview(call.image_url || null);
    } else if (initialLocation) {
      setFormData((prev) => ({
        ...prev,
        location: initialLocation,
      }));
    }
  }, [call, initialLocation]);

  useEffect(() => {
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [mode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave?.(formData);
    onClose();
  };

  const handleDelete = () => {
    if (call && confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) {
      onDelete?.(call);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-4">
              {!isEditing && call && (
                <span className="text-4xl">
                  {callTypes.find((t) => t.value === call.call_type)?.icon}
                </span>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'create' ? 'Nouvel appel' : mode === 'edit' ? 'Modifier l\'appel' : call?.title}
                </h2>
                {call && (
                  <p className="text-sm text-white/80">ID: {call.id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isEditing ? (
              // Mode édition/création
              <div className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Titre de l'appel *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Braquage en cours à la banque"
                  />
                </div>

                {/* Type et Priorité */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Type d'appel *</label>
                    <select
                      value={formData.call_type}
                      onChange={(e) => setFormData({ ...formData, call_type: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {callTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Priorité *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Détails de la situation..."
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.location.address || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, address: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Legion Square, Downtown"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Position: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                  </p>
                </div>

                {/* Upload image */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Image de la situation</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image_url: '' });
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-300 mb-1">Cliquez pour upload une image</p>
                        <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>
            ) : (
              // Mode visualisation
              <div className="space-y-4">
                {/* Description */}
                {call?.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">{call.description}</p>
                  </div>
                )}

                {/* Image */}
                {call?.image_url && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Image de la situation</h3>
                    <img
                      src={call.image_url}
                      alt="Situation"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Informations */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Localisation</div>
                    <div className="text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      {call?.location.address || 'Non spécifiée'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {call?.location.lat.toFixed(4)}, {call?.location.lng.toFixed(4)}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Créé le</div>
                    <div className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      {call && formatDateParis(call.created_at, { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {call && formatTimeParis(call.created_at)}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {call?.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Notes</h3>
                    <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg whitespace-pre-wrap">
                      {call.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex items-center justify-between">
            {isEditing ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.call_type}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </>
            ) : (
              <>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 ml-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
