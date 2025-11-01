'use client';

import { useState } from 'react';
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Identifiants incorrects');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push('/agency-selection');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Une erreur s\'est produite');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 relative overflow-hidden flex items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-dark-300 to-orange-900/20 animate-pulse-slow" />

      {/* Floating orbs background */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

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

          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
            Admin Access
          </h1>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl animate-scale-in border border-red-500/20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-red-400" />
            <h2 className="text-2xl font-bold text-white text-center">
              Connexion Admin
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-slide-down">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-xl text-white placeholder-gray-500
                         focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Admin"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-xl text-white placeholder-gray-500
                           focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all pr-12"
                  placeholder="****"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500
                       text-white px-6 py-4 rounded-xl font-semibold
                       flex items-center justify-center gap-3
                       transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/30
                       active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-300"
            >
              ← Retour à la connexion Discord
            </a>
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
