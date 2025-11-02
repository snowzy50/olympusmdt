/**
 * Utilitaires pour la gestion des dates avec fuseau horaire Paris
 * Créé par: Snowzy
 */

/**
 * Fuseau horaire de Paris
 */
export const PARIS_TIMEZONE = 'Europe/Paris';

/**
 * Obtenir la date actuelle en fuseau horaire Paris
 */
export function getNowInParis(): Date {
  // Obtenir l'heure actuelle en fuseau horaire Paris
  const now = new Date();
  const parisTime = new Date(now.toLocaleString('en-US', { timeZone: PARIS_TIMEZONE }));
  return parisTime;
}

/**
 * Obtenir la date actuelle en ISO string pour comparaisons
 * Utilise le fuseau horaire de Paris
 */
export function getNowISOInParis(): string {
  return getNowInParis().toISOString();
}

/**
 * Convertir une date en fuseau horaire Paris
 */
export function toParisTime(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: PARIS_TIMEZONE }));
}

/**
 * Formater une date pour l'affichage en français (Paris)
 */
export function formatDateParis(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    timeZone: PARIS_TIMEZONE,
    ...options,
  });
}

/**
 * Formater une heure pour l'affichage en français (Paris)
 */
export function formatTimeParis(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('fr-FR', {
    timeZone: PARIS_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Vérifier si une date est dans le futur (Paris timezone)
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = getNowInParis();
  return d.getTime() > now.getTime();
}

/**
 * Vérifier si une date est dans le passé (Paris timezone)
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = getNowInParis();
  return d.getTime() < now.getTime();
}

/**
 * Obtenir le nombre de jours jusqu'à une date (Paris timezone)
 */
export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = getNowInParis();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Obtenir le nombre d'heures jusqu'à une date (Paris timezone)
 */
export function getHoursUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = getNowInParis();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60));
}

/**
 * Formater la date et l'heure pour l'affichage
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDateParis(date, { day: 'numeric', month: 'short', year: 'numeric' })} à ${formatTimeParis(date)}`;
}
