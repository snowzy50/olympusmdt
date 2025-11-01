'use client';

import { FileText, User, Calendar, MapPin, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Report {
  id: string;
  title: string;
  type: string;
  officer: string;
  date: Date;
  location: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

interface ReportCardProps {
  report: Report;
}

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-dark-600 text-dark-300' },
  pending: { label: 'En attente', color: 'bg-accent-orange/20 text-accent-orange' },
  approved: { label: 'Approuvé', color: 'bg-accent-green/20 text-accent-green' },
  rejected: { label: 'Rejeté', color: 'bg-accent-red/20 text-accent-red' },
};

const priorityConfig = {
  low: { color: 'border-l-accent-green' },
  medium: { color: 'border-l-accent-orange' },
  high: { color: 'border-l-accent-red' },
};

export default function ReportCard({ report }: ReportCardProps) {
  const statusStyle = statusConfig[report.status];
  const priorityStyle = priorityConfig[report.priority];

  return (
    <div className={`glass rounded-xl p-6 card-hover border-l-4 ${priorityStyle.color} group cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-police-blue/20">
            <FileText className="w-5 h-5 text-police-blue-light" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-police-blue-light transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-dark-400">{report.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusStyle.color}`}>
            {statusStyle.label}
          </span>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <MoreVertical className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-sm text-dark-300">
          <User className="w-4 h-4" />
          <span>{report.officer}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-300">
          <Calendar className="w-4 h-4" />
          <span>{formatDistanceToNow(report.date, { addSuffix: true, locale: fr })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-300">
          <MapPin className="w-4 h-4" />
          <span>{report.location}</span>
        </div>
      </div>
    </div>
  );
}
