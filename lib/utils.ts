/**
 * Utilitaires communs
 * Cree par: Snowzy
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec support Tailwind
 * Utilise clsx pour la concatenation conditionnelle
 * et tailwind-merge pour resoudre les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
