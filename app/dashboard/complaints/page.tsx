'use client';

import { useState, useMemo } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Modal } from '@/components/ui/Modal';
import {
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Shield,
  Flag,
} from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  category: 'excessive_force' | 'misconduct' | 'discrimination' | 'corruption' | 'procedural' | 'harassment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'review' | 'resolved' | 'dismissed' | 'escalated';
  complainant: {
    firstName: string;
    lastName: string;
    id: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  accused: {
    name: string;
    badge: string;
    department: string;
    unit?: string;
  };
  incident: {
    date: string;
    time?: string;
    location: string;
    witnesses: number;
    description: string;
  };
  investigator?: string;
  deadline: string;
  isIA: boolean;
  evidence?: string[];
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintsPage() {
  const { data: complaints, addItem, updateItem } = useRealtimeSync<Complaint>('complaints');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Données de test initiales
  useMemo(() => {
    if (complaints.length === 0) {
      const testComplaints = [
        {
          title: "Usage excessif de la force",
          category: "excessive_force" as const,
          priority: "high" as const,
          status: "investigating" as const,
          complainant: {
            firstName: "Jean",
            lastName: "Dupont",
            id: "CIT-789456",
            phone: "+1 555-0123",
            email: "jean.dupont@email.com",
            address: "123 Rue Principal, Los Santos"
          },
          accused: {
            name: "Officier M. Johnson",
            badge: "Badge 247",
            department: "SASP",
            unit: "Patrol Unit 7"
          },
          incident: {
            date: new Date().toISOString().split('T')[0],
            time: "14:30",
            location: "Intersection Vinewood Blvd & Clinton Ave",
            witnesses: 2,
            description: "Usage disproportionné de la force lors d'une interpellation routière de routine."
          },
          investigator: "Lt. Rodriguez",
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          isIA: true,
          evidence: ["Rapport médical", "Vidéo dashcam", "Témoignages (2)"]
        },
        {
          title: "Conduite inappropriée",
          category: "misconduct" as const,
          priority: "medium" as const,
          status: "pending" as const,
          complainant: {
            firstName: "Marie",
            lastName: "Johnson",
            id: "CIT-654321",
            phone: "+1 555-0456"
          },
          accused: {
            name: "Sergent K. Brown",
            badge: "Badge 189",
            department: "SASP",
            unit: "Traffic Division"
          },
          incident: {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: "Route 68, Harmony",
            witnesses: 0,
            description: "Comportement verbal agressif et intimidant lors d'un contrôle routier."
          },
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isIA: false
        },
        {
          title: "Discrimination raciale",
          category: "discrimination" as const,
          priority: "high" as const,
          status: "resolved" as const,
          complainant: {
            firstName: "Carlos",
            lastName: "Martinez",
            id: "CIT-456789",
            email: "carlos.m@email.com"
          },
          accused: {
            name: "Agent S. Williams",
            badge: "Badge 312",
            department: "SASP"
          },
          incident: {
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: "Davis, Grove Street",
            witnesses: 3,
            description: "Profilage racial lors d'une patrouille de routine."
          },
          investigator: "Capt. Martinez",
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isIA: true,
          resolution: "Après enquête approfondie, l'agent a été sanctionné et a suivi une formation sur la diversité. La plainte est considérée comme fondée."
        }
      ];

      testComplaints.forEach(c => addItem(c));
    }
  }, []);

  // Filtrage
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${complaint.complainant.firstName} ${complaint.complainant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.accused.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Statistiques
  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    investigating: complaints.filter(c => c.status === 'investigating').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    highPriority: complaints.filter(c => c.priority === 'high' || c.priority === 'critical').length,
    ia: complaints.filter(c => c.isIA).length,
  }), [complaints]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      excessive_force: "Usage excessif de la force",
      misconduct: "Conduite inappropriée",
      discrimination: "Discrimination",
      corruption: "Corruption",
      procedural: "Violation de procédure",
      harassment: "Harcèlement",
      other: "Autre"
    };
    return labels[category] || category;
  };

  const handlePrint = (complaint: Complaint) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Plainte ${complaint.id}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              h1 { border-bottom: 2px solid #000; }
              .section { margin: 20px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>PLAINTE OFFICIELLE - ${complaint.id}</h1>
            <div class="section">
              <div><span class="label">Titre:</span> ${complaint.title}</div>
              <div><span class="label">Catégorie:</span> ${getCategoryLabel(complaint.category)}</div>
              <div><span class="label">Priorité:</span> ${complaint.priority}</div>
            </div>
            <div class="section">
              <h2>PLAIGNANT:</h2>
              <div><span class="label">Nom:</span> ${complaint.complainant.firstName} ${complaint.complainant.lastName}</div>
              <div><span class="label">ID:</span> ${complaint.complainant.id}</div>
              ${complaint.complainant.phone ? `<div><span class="label">Téléphone:</span> ${complaint.complainant.phone}</div>` : ''}
              ${complaint.complainant.email ? `<div><span class="label">Email:</span> ${complaint.complainant.email}</div>` : ''}
            </div>
            <div class="section">
              <h2>AGENT CONCERNÉ:</h2>
              <div><span class="label">Nom:</span> ${complaint.accused.name}</div>
              <div><span class="label">Badge:</span> ${complaint.accused.badge}</div>
              <div><span class="label">Département:</span> ${complaint.accused.department}</div>
            </div>
            <div class="section">
              <h2>INCIDENT:</h2>
              <div><span class="label">Date:</span> ${complaint.incident.date}${complaint.incident.time ? ' à ' + complaint.incident.time : ''}</div>
              <div><span class="label">Lieu:</span> ${complaint.incident.location}</div>
              <div><span class="label">Témoins:</span> ${complaint.incident.witnesses}</div>
              <div><span class="label">Description:</span><br/>${complaint.incident.description}</div>
            </div>
            <div class="section">
              <h2>ENQUÊTE:</h2>
              <div><span class="label">Statut:</span> ${complaint.status}</div>
              <div><span class="label">Enquêteur:</span> ${complaint.investigator || 'Non assigné'}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-dark-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Plaintes</h1>
                <p className="text-gray-400">Gestion des plaintes citoyennes</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Plainte
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon={FileText} color="gray" />
          <StatCard title="En attente" value={stats.pending} icon={Clock} color="yellow" />
          <StatCard title="En enquête" value={stats.investigating} icon={Search} color="blue" />
          <StatCard title="Résolues" value={stats.resolved} icon={CheckCircle} color="green" />
          <StatCard title="Priorité élevée" value={stats.highPriority} icon={Flag} color="red" />
          <StatCard title="Affaires Internes" value={stats.ia} icon={Shield} color="purple" />
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par ID, titre, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="investigating">En enquête</option>
            <option value="review">En révision</option>
            <option value="resolved">Résolue</option>
            <option value="dismissed">Classée</option>
            <option value="escalated">Escaladée</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="critical">Critique</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">Toutes les catégories</option>
            <option value="excessive_force">Usage excessif de la force</option>
            <option value="misconduct">Conduite inappropriée</option>
            <option value="discrimination">Discrimination</option>
            <option value="corruption">Corruption</option>
            <option value="procedural">Violation de procédure</option>
            <option value="harassment">Harcèlement</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Filter className="w-5 h-5" />
          <span>{filteredComplaints.length} plainte(s) trouvée(s)</span>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plainte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plaignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Accusé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Enquêteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{complaint.id}</p>
                        {complaint.isIA && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                            IA
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{complaint.title}</p>
                      <p className="text-gray-500 text-xs">{getCategoryLabel(complaint.category)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white">{complaint.complainant.firstName} {complaint.complainant.lastName}</p>
                      <p className="text-gray-500 text-sm">{complaint.complainant.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white">{complaint.accused.name}</p>
                      <p className="text-gray-500 text-sm">{complaint.accused.badge}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <p className={complaint.investigator ? "text-white" : "text-gray-500 italic"}>
                      {complaint.investigator || "Non assigné"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <DeadlineBadge deadline={complaint.deadline} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowDetailsModal(true);
                        }}
                        className="text-primary-400 hover:text-primary-300"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrint(complaint)}
                        className="text-gray-400 hover:text-gray-300"
                        title="Imprimer"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredComplaints.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune plainte trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Details */}
      {selectedComplaint && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedComplaint(null);
          }}
          title={`Plainte ${selectedComplaint.id}`}
          size="xl"
        >
          <ComplaintDetails complaint={selectedComplaint} onUpdate={updateItem} />
        </Modal>
      )}
    </div>
  );
}

// Composant StatCard
function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    gray: 'text-gray-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon className={`w-5 h-5 ${colors[color]}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// Composant Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    investigating: 'bg-blue-500/20 text-blue-400',
    review: 'bg-purple-500/20 text-purple-400',
    resolved: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
    escalated: 'bg-red-500/20 text-red-400',
  };

  const labels: Record<string, string> = {
    pending: 'En attente',
    investigating: 'En enquête',
    review: 'En révision',
    resolved: 'Résolue',
    dismissed: 'Classée',
    escalated: 'Escaladée',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}

// Composant Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  };

  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    critical: 'Critique',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
      {labels[priority] || priority}
    </span>
  );
}

// Composant Deadline Badge
function DeadlineBadge({ deadline }: { deadline: string }) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let color = 'text-gray-400';
  let label = `${deadlineDate.toLocaleDateString()}`;

  if (diffDays < 0) {
    color = 'text-red-400';
    label = `En retard de ${Math.abs(diffDays)}j`;
  } else if (diffDays <= 3) {
    color = 'text-red-400';
    label = `Dans ${diffDays}j`;
  } else if (diffDays <= 7) {
    color = 'text-orange-400';
    label = `Dans ${diffDays}j`;
  }

  return <p className={color}>{label}</p>;
}

// Composant Complaint Details
function ComplaintDetails({ complaint, onUpdate }: { complaint: Complaint; onUpdate: any }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">DESCRIPTION</h3>
          <p className="text-gray-300">{complaint.incident.description}</p>
        </div>

        {/* Incident */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">INCIDENT</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Date et heure</p>
              <p className="text-white">{complaint.incident.date} {complaint.incident.time && `à ${complaint.incident.time}`}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Lieu</p>
              <p className="text-white">{complaint.incident.location}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Nombre de témoins</p>
              <p className="text-white">{complaint.incident.witnesses}</p>
            </div>
          </div>
        </div>

        {/* Evidence */}
        {complaint.evidence && complaint.evidence.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-3">ÉLÉMENTS DE PREUVE</h3>
            <ul className="space-y-2">
              {complaint.evidence.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-300">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resolution */}
        {complaint.resolution && (
          <div>
            <h3 className="text-lg font-bold text-white mb-3">RÉSOLUTION</h3>
            <p className="text-gray-300">{complaint.resolution}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Plaignant */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Plaignant</h3>
          <div className="space-y-2">
            <p className="text-white font-medium">{complaint.complainant.firstName} {complaint.complainant.lastName}</p>
            <p className="text-gray-500 text-sm">{complaint.complainant.id}</p>
            {complaint.complainant.phone && (
              <p className="text-gray-400 text-sm">{complaint.complainant.phone}</p>
            )}
            {complaint.complainant.email && (
              <p className="text-gray-400 text-sm">{complaint.complainant.email}</p>
            )}
          </div>
        </div>

        {/* Agent concerné */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Agent Concerné</h3>
          <div className="space-y-2">
            <p className="text-white font-medium">{complaint.accused.name}</p>
            <p className="text-gray-500 text-sm">{complaint.accused.badge}</p>
            <p className="text-gray-400 text-sm">{complaint.accused.department}</p>
            {complaint.accused.unit && (
              <p className="text-gray-400 text-sm">{complaint.accused.unit}</p>
            )}
          </div>
        </div>

        {/* Enquête */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Enquête</h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Statut</p>
              <StatusBadge status={complaint.status} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Priorité</p>
              <PriorityBadge priority={complaint.priority} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Enquêteur</p>
              <p className={complaint.investigator ? "text-white" : "text-gray-500 italic"}>
                {complaint.investigator || "Non assigné"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Échéance</p>
              <DeadlineBadge deadline={complaint.deadline} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              const investigator = prompt("Nom de l'enquêteur:");
              if (investigator) {
                onUpdate(complaint.id, {
                  investigator,
                  status: 'investigating'
                });
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Assigner Enquêteur
          </button>
          <button
            onClick={() => {
              if (confirm("Transférer aux Affaires Internes?")) {
                onUpdate(complaint.id, {
                  status: 'escalated',
                  isIA: true
                });
              }
            }}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Transférer IA
          </button>
        </div>
      </div>
    </div>
  );
}
