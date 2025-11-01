/**
 * Tests Unitaires - Page de Connexion
 * Feature: 01-Login
 * Créé par: Snowzy
 * Date: 2025-11-01
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

// Mock de Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage', () => {
  describe('Rendering', () => {
    it('should render the page with all main elements', () => {
      render(<LoginPage />);

      // Vérifier le titre principal
      expect(screen.getByText('OlympusMDT')).toBeInTheDocument();

      // Vérifier le sous-titre
      expect(screen.getByText('Système de Terminal Mobile de Données')).toBeInTheDocument();

      // Vérifier le titre de la carte de connexion
      expect(screen.getByText('Connexion')).toBeInTheDocument();

      // Vérifier le texte d'instruction
      expect(screen.getByText('Connectez-vous avec votre compte Discord')).toBeInTheDocument();
    });

    it('should render the Discord login button', () => {
      render(<LoginPage />);

      const discordButton = screen.getByRole('button', { name: /se connecter avec discord/i });
      expect(discordButton).toBeInTheDocument();
      expect(discordButton).not.toBeDisabled();
    });

    it('should render the Admin link', () => {
      render(<LoginPage />);

      const adminLink = screen.getByRole('link', { name: /accès admin/i });
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute('href', '/admin');
    });

    it('should render the footer information', () => {
      render(<LoginPage />);

      expect(screen.getByText(/OlympusMDT v2.0/i)).toBeInTheDocument();
      expect(screen.getByText(/Créé par Snowzy/i)).toBeInTheDocument();
    });

    it('should have correct initial button text', () => {
      render(<LoginPage />);

      expect(screen.getByText('Se connecter avec Discord')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockPush.mockClear();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should show loading state when Discord button is clicked', async () => {
      render(<LoginPage />);

      const discordButton = screen.getByRole('button', { name: /se connecter avec discord/i });

      // Cliquer sur le bouton
      fireEvent.click(discordButton);

      // Vérifier l'état de chargement
      expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
      expect(discordButton).toBeDisabled();
    });

    it('should disable the button during loading', async () => {
      render(<LoginPage />);

      const discordButton = screen.getByRole('button', { name: /se connecter avec discord/i });

      fireEvent.click(discordButton);

      // Le bouton doit être désactivé pendant le chargement
      expect(discordButton).toBeDisabled();
    });

    it('should redirect to agency-selection page after delay', async () => {
      render(<LoginPage />);

      const discordButton = screen.getByRole('button', { name: /se connecter avec discord/i });

      fireEvent.click(discordButton);

      // Avancer le temps de 1500ms
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/agency-selection');
      });
    });
  });

  describe('Visual Elements', () => {
    it('should render the logo shield icon', () => {
      const { container } = render(<LoginPage />);

      // Vérifier la présence d'un conteneur de logo avec les bonnes classes
      const logoContainer = container.querySelector('.bg-gradient-to-br.from-primary-500.to-primary-700');
      expect(logoContainer).toBeInTheDocument();
    });

    it('should have correct Discord button color', () => {
      render(<LoginPage />);

      const discordButton = screen.getByRole('button', { name: /se connecter avec discord/i });

      // Vérifier que le bouton a la couleur Discord (#5865F2)
      expect(discordButton).toHaveClass('bg-[#5865F2]');
    });

    it('should render with glassmorphism effect', () => {
      const { container } = render(<LoginPage />);

      // Vérifier la présence de l'effet glass-strong
      const glassCard = container.querySelector('.glass-strong');
      expect(glassCard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<LoginPage />);

      // Vérifier la hiérarchie des titres
      const mainHeading = screen.getByRole('heading', { name: 'OlympusMDT', level: 1 });
      expect(mainHeading).toBeInTheDocument();

      const subHeading = screen.getByRole('heading', { name: 'Connexion', level: 2 });
      expect(subHeading).toBeInTheDocument();
    });

    it('should have clickable elements with proper roles', () => {
      render(<LoginPage />);

      // Bouton Discord
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Lien Admin
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });
});
