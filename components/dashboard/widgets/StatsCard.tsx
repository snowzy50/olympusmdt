/**
 * Carte de statistiques réutilisable
 * Créé par: Snowzy
 * Features: Animations, gradients, icônes dynamiques
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'yellow';
  delay?: number;
  onClick?: () => void;
}

const colorConfig = {
  blue: {
    gradient: 'from-blue-500/20 to-blue-700/20',
    border: 'border-blue-500/30',
    icon: 'bg-blue-500/20 text-blue-400',
    text: 'text-blue-400',
  },
  red: {
    gradient: 'from-red-500/20 to-red-700/20',
    border: 'border-red-500/30',
    icon: 'bg-red-500/20 text-red-400',
    text: 'text-red-400',
  },
  orange: {
    gradient: 'from-orange-500/20 to-orange-700/20',
    border: 'border-orange-500/30',
    icon: 'bg-orange-500/20 text-orange-400',
    text: 'text-orange-400',
  },
  green: {
    gradient: 'from-green-500/20 to-green-700/20',
    border: 'border-green-500/30',
    icon: 'bg-green-500/20 text-green-400',
    text: 'text-green-400',
  },
  purple: {
    gradient: 'from-purple-500/20 to-purple-700/20',
    border: 'border-purple-500/30',
    icon: 'bg-purple-500/20 text-purple-400',
    text: 'text-purple-400',
  },
  yellow: {
    gradient: 'from-yellow-500/20 to-yellow-700/20',
    border: 'border-yellow-500/30',
    icon: 'bg-yellow-500/20 text-yellow-400',
    text: 'text-yellow-400',
  },
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend = 'neutral',
  color = 'blue',
  delay = 0,
  onClick,
}: StatsCardProps) {
  const colors = colorConfig[color];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const className = `
    relative overflow-hidden
    bg-gradient-to-br ${colors.gradient}
    backdrop-blur-sm border ${colors.border}
    rounded-xl p-6
    hover:shadow-lg hover:shadow-${color}-500/10
    transition-all duration-300
    ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
    w-full text-left
  `;

  const content = (
    <>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== 'neutral' && (
            <div className={`flex items-center gap-1 ${colors.text} text-xs font-medium`}>
              <TrendIcon className="w-4 h-4" />
              <span>{trend === 'up' ? '+' : '-'}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </>
  );

  if (onClick) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className={className}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      {content}
    </motion.div>
  );
}
