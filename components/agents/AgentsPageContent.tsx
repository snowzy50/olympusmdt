'use client';

import React, { useState, useMemo } from 'react';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { supabaseToLocal, localToSupabase } from '@/types/agent-adapter';
import { Modal } from '@/components/ui/Modal';
import {
  Users,
  UserCheck,
  Clock,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  BarChart3,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  Agent,
  AgentFilters,
  AgentGrade,
  AgentStatus,
  AgentDivision,
  AgentCertification,
  GRADE_CONFIG,
  STATUS_CONFIG,
  DIVISION_CONFIG,
  CERTIFICATION_CONFIG,
} from '@/types/agent';

interface AgentsPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function AgentsPageContent({ agencyId, agencyName }: AgentsPageContentProps) {
  const { agents: supabaseAgents, isLoading, addAgent: addSupabaseAgent, updateAgent, deleteAgent } = useSupabaseAgents(agencyId);

  // Vérifier si Supabase est configuré
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Convertir les agents Supabase en agents locaux
  const agents = useMemo(() => supabaseAgents.map(supabaseToLocal), [supabaseAgents]);

  const [filters, setFilters] = useState<AgentFilters>({
    search: '',
    grade: 'all',
    status: 'all',
    division: 'all',
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'active').length;
    const offDuty = agents.filter(a => a.status === 'off_duty').length;
    const training = agents.filter(a => a.status === 'training').length;

    return { total, active, offDuty, training };
  }, [agents]);

  // Filtrage des agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      // Filtre par recherche
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          agent.firstName.toLowerCase().includes(search) ||
          agent.lastName.toLowerCase().includes(search) ||
          agent.badge.toLowerCase().includes(search) ||
          agent.discordUsername.toLowerCase().includes(search);

        if (!matchesSearch) {
          return false;
        }
      }

      // Filtre par grade
      if (filters.grade !== 'all' && agent.grade !== filters.grade) {
        return false;
      }

      // Filtre par statut
      if (filters.status !== 'all' && agent.status !== filters.status) {
        return false;
      }

      // Filtre par division
      if (filters.division !== 'all' && agent.division !== filters.division) {
        return false;
      }

      return true;
    });
  }, [agents, filters]);

  // Calcul de l'ancienneté
  const calculateSeniority = (dateJoined: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(dateJoined).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} jours`;
    if (days < 365) return `${Math.floor(days / 30)} mois`;
    return `${Math.floor(days / 365)} ans`;
  };

  const handleAddAgent = async (newAgent: Partial<Agent>) => {
    console.log('🚀 [DEBUT] Tentative d\'ajout d\'agent...');
    console.log('📝 [DATA] Données reçues du formulaire:', JSON.stringify(newAgent, null, 2));

    try {
      // Vérifier que les champs requis sont présents
      if (!newAgent.discordUsername || !newAgent.badge || !newAgent.firstName || !newAgent.lastName) {
        console.error('❌ [ERREUR] Champs requis manquants');
        alert('❌ Erreur: Tous les champs obligatoires doivent être remplis !');
        return;
      }

      console.log('✅ [CHECK] Tous les champs requis sont présents');

      // Convertir l'agent local en format Supabase
      console.log('🔄 [CONVERSION] Conversion vers format Supabase...');
      const supabaseData = localToSupabase(newAgent, agencyId);
      console.log('📤 [SUPABASE] Données converties:', JSON.stringify(supabaseData, null, 2));

      // Ajouter à Supabase
      console.log('💾 [INSERT] Envoi vers Supabase...');
      const result = await addSupabaseAgent(supabaseData);
      console.log('📥 [RESULT] Résultat de Supabase:', result);

      if (result) {
        console.log('✅ [SUCCESS] Agent ajouté avec succès !');
        console.log('🆔 [ID] Nouvel agent ID:', result.id);
        alert('✅ Agent ajouté avec succès !');
        setShowAddModal(false);
      } else {
        console.error('❌ [ERREUR] Aucun résultat retourné par Supabase');
        alert('❌ Erreur: Aucun résultat retourné. Vérifiez la console.');
      }
    } catch (error) {
      console.error('❌ [EXCEPTION] Erreur lors de l\'ajout:', error);
      console.error('📋 [DETAILS] Détails de l\'erreur:', (error as Error).message);
      console.error('📚 [STACK] Stack trace:', (error as Error).stack);
      alert('❌ Erreur lors de l\'ajout de l\'agent:\n\n' + (error as Error).message);
    }

    console.log('🏁 [FIN] Fin de la tentative d\'ajout');
  };

  const getGradeColor = (grade: AgentGrade) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      amber: 'bg-amber-500',
    };
    return colors[GRADE_CONFIG[grade].color] || 'bg-gray-500';
  };

  const getStatusColor = (status: AgentStatus) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      gray: 'bg-gray-500',
    };
    return colors[STATUS_CONFIG[status].color] || 'bg-gray-500';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Agents</h1>
          <p className="text-gray-400">Personnel de l&apos;agence {agencyName}</p>
        </div>
        <button
          onClick={() => {
            console.log('🔘 [BUTTON] Bouton "Ajouter un agent" cliqué');
            console.log('🔘 [STATE] État actuel de showAddModal:', showAddModal);
            setShowAddModal(true);
            console.log('🔘 [STATE] État après setShowAddModal(true):', true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un agent
        </button>
      </div>

      {/* Avertissement Supabase non configuré */}
      {!isSupabaseConfigured && (
        <div className="mb-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-500 font-semibold mb-1">Supabase non configuré</h3>
              <p className="text-yellow-200/80 text-sm mb-2">
                Pour utiliser la synchronisation temps réel et la persistance des données, vous devez configurer Supabase.
              </p>
              <div className="bg-gray-900 rounded p-3 mt-2">
                <p className="text-xs text-gray-400 mb-2">Ajoutez ces variables dans votre fichier <code className="text-blue-400">.env.local</code> :</p>
                <code className="text-xs text-green-400 block">
                  NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase<br/>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Agents</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Agents actifs</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Hors service</p>
              <p className="text-3xl font-bold text-white">{stats.offDuty}</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En formation</p>
              <p className="text-3xl font-bold text-white">{stats.training}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, badge, grade..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-750 text-white rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filtres
          </button>
          {(filters.grade !== 'all' || filters.status !== 'all' || filters.division !== 'all') && (
            <button
              onClick={() => setFilters({ search: filters.search, grade: 'all', status: 'all', division: 'all' })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/50 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              Réinitialiser
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Grade
              </label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value as AgentGrade | 'all' })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les grades</option>
                {Object.entries(GRADE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as AgentStatus | 'all' })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Division
              </label>
              <select
                value={filters.division}
                onChange={(e) => setFilters({ ...filters, division: e.target.value as AgentDivision | 'all' })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les divisions</option>
                {Object.entries(DIVISION_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des agents */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Division
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Certifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ancienneté
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {agent.discordAvatar ? (
                        <img
                          src={agent.discordAvatar}
                          alt={agent.discordUsername}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {agent.firstName[0]}{agent.lastName[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {agent.firstName} {agent.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">{agent.badge}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getGradeColor(agent.grade)}`}>
                      {GRADE_CONFIG[agent.grade].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">
                      {DIVISION_CONFIG[agent.division].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {agent.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(agent.status)}`}>
                      {STATUS_CONFIG[agent.status].icon} {STATUS_CONFIG[agent.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {calculateSeniority(agent.dateJoined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowProfileModal(true);
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                        title="Voir le profil"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-700 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-700 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
                        title="Historique"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun agent trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Ajout Agent */}
      <AddAgentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAgent}
      />

      {/* Modal Profil Agent */}
      {selectedAgent && (
        <AgentProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedAgent(null);
          }}
          agent={selectedAgent}
        />
      )}
    </div>
  );
}

// Modal d'ajout d'agent
function AddAgentModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (agent: Partial<Agent>) => Promise<void>;
}) {
  console.log('📦 [MODAL] AddAgentModal render - isOpen:', isOpen);

  const [formData, setFormData] = useState<Partial<Agent>>({
    discordUsername: '',
    badge: '',
    firstName: '',
    lastName: '',
    grade: 'cadet',
    division: 'patrol',
    certifications: [],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📋 [FORM] Formulaire soumis');
    console.log('📝 [FORM DATA] Données du formulaire:', formData);

    // Bloquer les multiples soumissions
    if (isSubmitting) {
      console.warn('⚠️ [FORM] Soumission déjà en cours, ignoré');
      return;
    }

    setIsSubmitting(true);
    console.log('🔒 [FORM] Bouton désactivé (en cours d\'envoi...)');

    try {
      await onAdd(formData);
      console.log('✅ [FORM] Agent ajouté, reset du formulaire');

      // Reset du formulaire après succès
      setFormData({
        discordUsername: '',
        badge: '',
        firstName: '',
        lastName: '',
        grade: 'cadet',
        division: 'patrol',
        certifications: [],
        notes: '',
      });
    } catch (error) {
      console.error('❌ [FORM] Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
      console.log('🔓 [FORM] Bouton réactivé');
    }
  };

  const toggleCertification = (cert: AgentCertification) => {
    const certs = formData.certifications || [];
    if (certs.includes(cert)) {
      setFormData({
        ...formData,
        certifications: certs.filter(c => c !== cert),
      });
    } else {
      setFormData({
        ...formData,
        certifications: [...certs, cert],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un agent">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discord Username
            </label>
            <input
              type="text"
              required
              value={formData.discordUsername}
              onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Badge
            </label>
            <input
              type="text"
              required
              placeholder="#247"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prénom
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grade
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value as AgentGrade })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(GRADE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Division
            </label>
            <select
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value as AgentDivision })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(DIVISION_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Certifications
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(CERTIFICATION_CONFIG).map((cert) => (
              <label key={cert} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.certifications?.includes(cert as AgentCertification)}
                  onChange={() => toggleCertification(cert as AgentCertification)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Ajout en cours...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Créer l&apos;agent</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal de profil agent
function AgentProfileModal({
  isOpen,
  onClose,
  agent,
}: {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}) {
  if (!isOpen) return null;

  const calculateSeniority = (dateJoined: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(dateJoined).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} jours`;
    if (days < 365) return `${Math.floor(days / 30)} mois`;
    return `${Math.floor(days / 365)} ans`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil de l'agent">
      <div className="grid grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-4">
          <div className="flex flex-col items-center p-6 bg-gray-700 rounded-lg">
            {agent.discordAvatar ? (
              <img
                src={agent.discordAvatar}
                alt={agent.discordUsername}
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {agent.firstName[0]}{agent.lastName[0]}
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-1">
              {agent.firstName} {agent.lastName}
            </h3>
            <p className="text-gray-400 mb-2">{agent.badge}</p>
            <p className="text-gray-500 text-sm">@{agent.discordUsername}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-3">Informations</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Grade:</span>
                <span className="text-white font-medium">{GRADE_CONFIG[agent.grade].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Division:</span>
                <span className="text-white font-medium">{DIVISION_CONFIG[agent.division].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut:</span>
                <span className="text-white font-medium">{STATUS_CONFIG[agent.status].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ancienneté:</span>
                <span className="text-white font-medium">{calculateSeniority(agent.dateJoined)}</span>
              </div>
            </div>
          </div>

          {agent.certifications.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {agent.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-3">Statistiques</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Heures de service</p>
                <p className="text-2xl font-bold text-white">{agent.stats.totalHours}h</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Interventions</p>
                <p className="text-2xl font-bold text-white">{agent.stats.interventions}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Arrestations</p>
                <p className="text-2xl font-bold text-white">{agent.stats.arrests}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Rapports</p>
                <p className="text-2xl font-bold text-white">{agent.stats.reportsWritten}</p>
              </div>
            </div>
          </div>

          {agent.notes && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Notes</h4>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{agent.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
