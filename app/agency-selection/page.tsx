'use client';

import { useState, useEffect } from 'react';
import { Activity, Flame, Home, Scale, Shield, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface Agency {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Shield;
  logo: string;
  color: string;
  gradient: string;
  hoverBorder: string;
  hoverBg: string;
  dashboardPath: string;
}

const allAgencies: Agency[] = [
  {
    id: 'sasp',
    name: 'Police d\'État',
    shortName: 'SASP',
    description: 'San Andreas State Police',
    icon: Shield,
    logo: '/images/agencies/sasp.png',
    color: 'primary',
    gradient: 'from-primary-600 to-primary-800',
    hoverBorder: 'border-primary-400',
    hoverBg: 'bg-primary-50',
    dashboardPath: '/dashboard/sasp',
  },
  {
    id: 'lspd',
    name: 'Police de Los Santos',
    shortName: 'LSPD',
    description: 'Los Santos Police Department',
    icon: Shield,
    logo: '/images/agencies/lspd.png',
    color: 'primary',
    gradient: 'from-primary-600 to-primary-800',
    hoverBorder: 'border-primary-400',
    hoverBg: 'bg-primary-50',
    dashboardPath: '/dashboard/lspd',
  },
  {
    id: 'bcso',
    name: 'Shérif du Comté',
    shortName: 'BCSO',
    description: 'Blaine County Sheriff Office',
    icon: Shield,
    logo: '/images/agencies/bcso.png',
    color: 'primary',
    gradient: 'from-primary-600 to-primary-800',
    hoverBorder: 'border-primary-400',
    hoverBg: 'bg-primary-50',
    dashboardPath: '/dashboard/bcso',
  },
  {
    id: 'ems',
    name: 'Services médicaux',
    shortName: 'EMS',
    description: 'Emergency Medical Services',
    icon: Activity,
    logo: '/images/agencies/ems.png',
    color: 'error',
    gradient: 'from-error-600 to-error-800',
    hoverBorder: 'border-error-400',
    hoverBg: 'bg-error-50',
    dashboardPath: '/dashboard/ems',
  },
  {
    id: 'doj',
    name: 'Justice',
    shortName: 'DOJ',
    description: 'Department of Justice',
    icon: Scale,
    logo: '/images/agencies/doj.webp',
    color: 'purple',
    gradient: 'from-purple-600 to-purple-800',
    hoverBorder: 'border-purple-400',
    hoverBg: 'bg-purple-50',
    dashboardPath: '/dashboard/doj',
  },
  {
    id: 'safd',
    name: 'Pompiers',
    shortName: 'SAFD',
    description: 'San Andreas Fire Department',
    icon: Flame,
    logo: '/images/agencies/safd.png',
    color: 'error',
    gradient: 'from-red-600 to-orange-800',
    hoverBorder: 'border-red-400',
    hoverBg: 'bg-red-50',
    dashboardPath: '/dashboard/safd',
  },
  {
    id: 'samc',
    name: 'Services médicaux',
    shortName: 'SAMC',
    description: 'San Andreas Medical Center',
    icon: Activity,
    logo: '/images/agencies/samc.png',
    color: 'error',
    gradient: 'from-red-600 to-red-800',
    hoverBorder: 'border-red-400',
    hoverBg: 'bg-red-50',
    dashboardPath: '/dashboard/samc',
  },
  {
    id: 'dynasty8',
    name: 'Immobilier',
    shortName: 'Dynasty 8',
    description: 'Dynasty 8 Real Estate',
    icon: Home,
    logo: '/images/agencies/dynasty8.png',
    color: 'primary',
    gradient: 'from-blue-600 to-blue-800',
    hoverBorder: 'border-blue-400',
    hoverBg: 'bg-blue-50',
    dashboardPath: '/dashboard/dynasty8',
  },
];

export default function AgencySelectionPage() {
  const [hoveredAgency, setHoveredAgency] = useState<string | null>(null);
  const [userAgencies, setUserAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Filtrer les agences en fonction des rôles de l'utilisateur
    const allowedAgencyIds = session.user?.agencies || [];
    const filtered = allAgencies.filter(agency =>
      allowedAgencyIds.includes(agency.id)
    );

    setUserAgencies(filtered);
    setIsLoading(false);

    // Rediriger si aucune agence autorisée
    if (filtered.length === 0) {
      router.push('/login?error=no_roles');
    }
  }, [session, status, router]);

  const handleAgencyClick = (agency: Agency) => {
    router.push(agency.dashboardPath);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos autorisations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-gray-700" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bienvenue, {session?.user?.name || 'Agent'}
          </h1>

          <p className="text-gray-600 mb-4">
            Choisissez votre département pour accéder à l&apos;interface MDT correspondante
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        {/* Agency Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {userAgencies.map((agency) => {
            const Icon = agency.icon;
            const isHovered = hoveredAgency === agency.id;

            return (
              <div
                key={agency.id}
                role="button"
                tabIndex={0}
                className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  isHovered
                    ? `${agency.hoverBorder} ${agency.hoverBg} shadow-xl scale-105`
                    : 'bg-white border-gray-200 shadow-md'
                }`}
                onClick={() => handleAgencyClick(agency)}
                onMouseEnter={() => setHoveredAgency(agency.id)}
                onMouseLeave={() => setHoveredAgency(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAgencyClick(agency);
                  }
                }}
              >
                {/* Logo */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-20 h-20 rounded-full overflow-hidden transition-transform duration-300 ${
                    isHovered ? 'scale-110' : ''
                  }`}>
                    <img
                      src={agency.logo}
                      alt={`Logo ${agency.shortName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback si l'image n'existe pas
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${agency.gradient} rounded-full flex items-center justify-center"><svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>`;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Agency Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {agency.shortName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {agency.name}
                  </p>
                </div>

                {/* Button */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
                  <span>Accéder au MDT</span>
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                    isHovered ? 'translate-x-1' : ''
                  }`} />
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-xs text-success-600 font-medium">Autorisé</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Status */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>Tous les départements sont opérationnels</span>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="mt-12 text-center text-gray-500 text-xs">
          <p>© OlympusRP.fr. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
