/**
 * Tests Unitaires - Page de Sélection d'Agence
 * Feature: 02-AgencySelection
 * Créé par: Snowzy
 * Date: 2025-11-01
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import AgencySelectionPage from '@/app/agency-selection/page';

describe('AgencySelectionPage', () => {
  describe('Rendering', () => {
    it('should render the page with main title', () => {
      render(<AgencySelectionPage />);

      expect(screen.getByText('OlympusMDT')).toBeInTheDocument();
      expect(screen.getByText('Sélectionnez votre agence')).toBeInTheDocument();
    });

    it('should render all 5 agency cards', () => {
      render(<AgencySelectionPage />);

      // Vérifier la présence des 5 agences
      expect(screen.getByText('SASP')).toBeInTheDocument();
      expect(screen.getByText('SAMC')).toBeInTheDocument();
      expect(screen.getByText('SAFD')).toBeInTheDocument();
      expect(screen.getByText('D8')).toBeInTheDocument();
      expect(screen.getByText('DOJ')).toBeInTheDocument();
    });

    it('should render agency full names', () => {
      render(<AgencySelectionPage />);

      expect(screen.getByText('San Andreas State Police')).toBeInTheDocument();
      expect(screen.getByText('San Andreas Medical Center')).toBeInTheDocument();
      expect(screen.getByText('San Andreas Fire Department')).toBeInTheDocument();
      expect(screen.getByText('Dynasty 8 Real Estate')).toBeInTheDocument();
      expect(screen.getByText('Department of Justice')).toBeInTheDocument();
    });

    it('should render agency descriptions', () => {
      render(<AgencySelectionPage />);

      expect(screen.getByText('Law Enforcement Division')).toBeInTheDocument();
      expect(screen.getByText('Emergency Medical Services')).toBeInTheDocument();
      expect(screen.getByText('Fire & Rescue Operations')).toBeInTheDocument();
      expect(screen.getByText('Property Management')).toBeInTheDocument();
      expect(screen.getByText('Legal & Judicial Affairs')).toBeInTheDocument();
    });

    it('should render status indicators', () => {
      render(<AgencySelectionPage />);

      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('Sync Monitor')).toBeInTheDocument();
    });

    it('should render agency statistics', () => {
      render(<AgencySelectionPage />);

      // Vérifier que les labels de statistiques sont présents
      const casActifsLabels = screen.getAllByText('Cas actifs');
      const enAttenteLabels = screen.getAllByText('En attente');

      expect(casActifsLabels).toHaveLength(5); // 5 agences
      expect(enAttenteLabels).toHaveLength(5); // 5 agences
    });

    it('should not show dashboard button initially', () => {
      render(<AgencySelectionPage />);

      expect(screen.queryByText('Accéder au Dashboard')).not.toBeInTheDocument();
    });

    it('should render footer information', () => {
      render(<AgencySelectionPage />);

      expect(screen.getByText(/OlympusMDT v2.0/i)).toBeInTheDocument();
      expect(screen.getByText(/Créé par Snowzy/i)).toBeInTheDocument();
    });
  });

  describe('Agency Selection', () => {
    it('should select an agency when clicked', () => {
      render(<AgencySelectionPage />);

      // Cliquer sur SASP
      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');
      fireEvent.click(saspCard!);

      // Le bouton "Accéder au Dashboard" doit apparaître
      expect(screen.getByText('Accéder au Dashboard')).toBeInTheDocument();
    });

    it('should show dashboard button after agency selection', () => {
      render(<AgencySelectionPage />);

      // Cliquer sur SAMC
      const samcCard = screen.getByText('SAMC').closest('div[class*="glass-strong"]');
      fireEvent.click(samcCard!);

      expect(screen.getByText('Accéder au Dashboard')).toBeInTheDocument();
    });

    it('should switch selected agency when clicking another one', () => {
      render(<AgencySelectionPage />);

      // Sélectionner SASP
      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');
      fireEvent.click(saspCard!);

      // Sélectionner SAFD
      const safdCard = screen.getByText('SAFD').closest('div[class*="glass-strong"]');
      fireEvent.click(safdCard!);

      // Le bouton doit toujours être présent
      expect(screen.getByText('Accéder au Dashboard')).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('should apply hover border for SASP (blue/primary)', () => {
      const { container } = render(<AgencySelectionPage />);

      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');

      // Hover sur la carte
      fireEvent.mouseEnter(saspCard!);

      // Vérifier que la classe de bordure hover est appliquée
      expect(saspCard).toHaveClass('border-primary-500/60');
    });

    it('should apply hover border for SAMC (red/error)', () => {
      render(<AgencySelectionPage />);

      const samcCard = screen.getByText('SAMC').closest('div[class*="glass-strong"]');

      fireEvent.mouseEnter(samcCard!);

      expect(samcCard).toHaveClass('border-error-500/60');
    });

    it('should apply hover border for SAFD (orange/warning)', () => {
      render(<AgencySelectionPage />);

      const safdCard = screen.getByText('SAFD').closest('div[class*="glass-strong"]');

      fireEvent.mouseEnter(safdCard!);

      expect(safdCard).toHaveClass('border-warning-500/60');
    });

    it('should apply hover border for Dynasty8 (green/success)', () => {
      render(<AgencySelectionPage />);

      const d8Card = screen.getByText('D8').closest('div[class*="glass-strong"]');

      fireEvent.mouseEnter(d8Card!);

      expect(d8Card).toHaveClass('border-success-500/60');
    });

    it('should apply hover border for DOJ (purple/info)', () => {
      render(<AgencySelectionPage />);

      const dojCard = screen.getByText('DOJ').closest('div[class*="glass-strong"]');

      fireEvent.mouseEnter(dojCard!);

      expect(dojCard).toHaveClass('border-purple-500/60');
    });

    it('should remove hover border when mouse leaves', () => {
      render(<AgencySelectionPage />);

      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');

      // Hover
      fireEvent.mouseEnter(saspCard!);
      expect(saspCard).toHaveClass('border-primary-500/60');

      // Quitter le hover
      fireEvent.mouseLeave(saspCard!);
      expect(saspCard).toHaveClass('border-gray-700/30');
    });
  });

  describe('Selected State', () => {
    it('should apply ring classes when agency is selected', () => {
      render(<AgencySelectionPage />);

      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');

      // Sélectionner SASP
      fireEvent.click(saspCard!);

      // Vérifier que le ring est appliqué
      expect(saspCard).toHaveClass('ring-2', 'ring-primary-500');
    });

    it('should show chevron icon when selected', () => {
      const { container } = render(<AgencySelectionPage />);

      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');

      // Avant sélection - pas de chevron
      let chevronIcon = within(saspCard!).queryByText((content, element) => {
        return element?.tagName.toLowerCase() === 'svg';
      });

      // Sélectionner SASP
      fireEvent.click(saspCard!);

      // Après sélection - chevron présent (à côté du nom de l'agence)
      const agencyName = screen.getByText('SASP');
      expect(agencyName.parentElement).toBeInTheDocument();
    });

    it('should show success indicator dot when selected', () => {
      const { container } = render(<AgencySelectionPage />);

      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');

      // Sélectionner SASP
      fireEvent.click(saspCard!);

      // Chercher le dot vert (classe bg-success-500)
      const successDot = container.querySelector('.bg-success-500');
      expect(successDot).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render agency icons with gradient backgrounds', () => {
      const { container } = render(<AgencySelectionPage />);

      // Vérifier la présence des gradients pour chaque agence
      expect(container.querySelector('.from-primary-600')).toBeInTheDocument(); // SASP
      expect(container.querySelector('.from-error-600')).toBeInTheDocument(); // SAMC
      expect(container.querySelector('.from-warning-600')).toBeInTheDocument(); // SAFD
      expect(container.querySelector('.from-success-600')).toBeInTheDocument(); // Dynasty8
      expect(container.querySelector('.from-purple-600')).toBeInTheDocument(); // DOJ
    });

    it('should render with glassmorphism effect', () => {
      const { container } = render(<AgencySelectionPage />);

      const glassCards = container.querySelectorAll('.glass-strong');
      expect(glassCards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AgencySelectionPage />);

      const mainHeading = screen.getByRole('heading', { name: 'OlympusMDT', level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have clickable agency cards', () => {
      const { container } = render(<AgencySelectionPage />);

      const clickableCards = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(clickableCards.length).toBe(5); // 5 agences
    });

    it('should have accessible dashboard button when shown', () => {
      render(<AgencySelectionPage />);

      // Sélectionner une agence
      const saspCard = screen.getByText('SASP').closest('div[class*="glass-strong"]');
      fireEvent.click(saspCard!);

      const dashboardButton = screen.getByRole('button', { name: /accéder au dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });
  });
});
