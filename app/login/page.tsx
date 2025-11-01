'use client';

import { useState, useEffect, Suspense } from 'react';
import { LogIn, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'no_roles') {
      setError('Vous n\'avez pas les rôles Discord requis pour accéder à cette application.');
    } else if (errorParam) {
      setError('Une erreur s\'est produite lors de la connexion. Veuillez réessayer.');
    }
  }, [searchParams]);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('discord', {
        callbackUrl: '/agency-selection',
        redirect: true,
      });

      if (result?.error) {
        setError('Échec de la connexion. Veuillez réessayer.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur s\'est produite. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 relative overflow-hidden flex items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-300 to-purple-900/20 animate-pulse-slow" />

      {/* Floating orbs background */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-slide-down">
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-40 h-40 animate-float-3d">
              <img
                src="/images/logo.png"
                alt="Olympus RP Logo"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Olympus MDT
          </h1>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl animate-scale-in">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            Connexion
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Connectez-vous avec votre compte Discord
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-slide-down">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Discord Login Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-4 rounded-xl font-semibold
                     flex items-center justify-center gap-3
                     transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#5865F2]/30
                     active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                     group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                <span>Se connecter avec Discord</span>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>

          {/* Admin Link */}
          <div className="mt-6 text-center">
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-300 inline-flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Accès Admin
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm animate-fade-in">
          <p>© OlympusRP.fr. Tous droits réservés.</p>
          <p className="mt-1">Créé par Snowzy</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
