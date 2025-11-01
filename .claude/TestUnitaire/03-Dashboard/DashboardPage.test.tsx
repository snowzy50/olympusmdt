/**
 * Tests Unitaires - Page Dashboard
 * Feature: 03-Dashboard
 * Créé par: Snowzy
 * Date: 2025-11-01
 */

import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

// Mock Sidebar component
jest.mock('@/components/layout/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Mock Sidebar</div>;
  };
});

describe('DashboardPage', () => {
  describe('Rendering', () => {
    it('should render the dashboard with main title', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render user welcome message', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/Bienvenue, Officier Smith - SASP #1234/i)).toBeInTheDocument();
    });

    it('should render status indicators', () => {
      render(<DashboardPage />);

      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('Sync Monitor')).toBeInTheDocument();
    });

    it('should render sidebar', () => {
      render(<DashboardPage />);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render notification badge with count', () => {
      const { container } = render(<DashboardPage />);

      // Le badge de notification doit afficher "3"
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Dashboard Cards', () => {
    it('should render all 4 main dashboard cards', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Plaintes Critiques')).toBeInTheDocument();
      expect(screen.getByText('Convocations Urgentes')).toBeInTheDocument();
      expect(screen.getByText('Équipements')).toBeInTheDocument();
      expect(screen.getByText('Événements')).toBeInTheDocument();
    });

    it('should render dashboard card values', () => {
      render(<DashboardPage />);

      expect(screen.getByText('7')).toBeInTheDocument(); // Plaintes critiques
      expect(screen.getByText('12')).toBeInTheDocument(); // Convocations urgentes
      expect(screen.getByText('94%')).toBeInTheDocument(); // Équipements
      expect(screen.getByText('23')).toBeInTheDocument(); // Événements
    });

    it('should render dashboard card subtitles', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Requiert action immédiate')).toBeInTheDocument();
      expect(screen.getByText('Prochaines 48h')).toBeInTheDocument();
      expect(screen.getByText('Disponibilité opérationnelle')).toBeInTheDocument();
      expect(screen.getByText('Planifiés ce mois')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should render the 3 statistics cards', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Cas actifs')).toBeInTheDocument();
      expect(screen.getByText('Cas résolus')).toBeInTheDocument();
      expect(screen.getByText('Officiers actifs')).toBeInTheDocument();
    });

    it('should render statistics values', () => {
      render(<DashboardPage />);

      expect(screen.getByText('27')).toBeInTheDocument(); // Cas actifs
      expect(screen.getByText('156')).toBeInTheDocument(); // Cas résolus
      expect(screen.getByText('42')).toBeInTheDocument(); // Officiers actifs
    });

    it('should render statistics trends', () => {
      render(<DashboardPage />);

      expect(screen.getByText('+3 cette semaine')).toBeInTheDocument();
      expect(screen.getByText('+12 ce mois')).toBeInTheDocument();
      expect(screen.getByText('En service maintenant')).toBeInTheDocument();
    });
  });

  describe('Recent Cases Section', () => {
    it('should render recent cases title', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Cas Récents')).toBeInTheDocument();
    });

    it('should render all 3 recent cases', () => {
      render(<DashboardPage />);

      expect(screen.getByText('2024-001')).toBeInTheDocument();
      expect(screen.getByText('2024-002')).toBeInTheDocument();
      expect(screen.getByText('2024-003')).toBeInTheDocument();
    });

    it('should render case descriptions', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Vol de véhicule')).toBeInTheDocument();
      expect(screen.getByText('Accident routier')).toBeInTheDocument();
      expect(screen.getByText('Excès de vitesse')).toBeInTheDocument();
    });

    it('should render case badges with correct variants', () => {
      render(<DashboardPage />);

      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('investigating')).toBeInTheDocument();
      expect(screen.getByText('resolved')).toBeInTheDocument();
    });

    it('should render "Voir tout" button', () => {
      render(<DashboardPage />);

      const voirToutButtons = screen.getAllByText('Voir tout');
      expect(voirToutButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Notifications Section', () => {
    it('should render notifications title', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should render all 3 notifications', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Nouvelle plainte critique nécessite attention')).toBeInTheDocument();
      expect(screen.getByText('Convocation prévue dans 30 minutes')).toBeInTheDocument();
      expect(screen.getByText('Rapport mensuel disponible')).toBeInTheDocument();
    });

    it('should render notification timestamps', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Il y a 2 min')).toBeInTheDocument();
      expect(screen.getByText('Il y a 15 min')).toBeInTheDocument();
      expect(screen.getByText('Il y a 1h')).toBeInTheDocument();
    });

    it('should render "Tout marquer lu" button', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Tout marquer lu')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Section', () => {
    it('should render quick actions title', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Actions Rapides')).toBeInTheDocument();
    });

    it('should render all 4 quick action buttons', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Nouveau cas')).toBeInTheDocument();
      expect(screen.getByText('Patrouille')).toBeInTheDocument();
      expect(screen.getByText('Convocation')).toBeInTheDocument();
      expect(screen.getByText('Rapport')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have sidebar on the left (ml-64 class on main)', () => {
      const { container } = render(<DashboardPage />);

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('ml-64');
    });

    it('should have sticky header', () => {
      const { container } = render(<DashboardPage />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
    });

    it('should use glass effect', () => {
      const { container } = render(<DashboardPage />);

      const glassElements = container.querySelectorAll('.glass, .glass-strong');
      expect(glassElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<DashboardPage />);

      const mainHeading = screen.getByRole('heading', { name: 'Dashboard', level: 1 });
      expect(mainHeading).toBeInTheDocument();

      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      render(<DashboardPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
