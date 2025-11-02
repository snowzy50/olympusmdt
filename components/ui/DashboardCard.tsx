'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'critical' | 'warning' | 'info' | 'success';
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  trend,
  onClick,
}: DashboardCardProps) {
  const variantClasses = {
    critical: 'dashboard-card-critical',
    warning: 'dashboard-card-warning',
    info: 'dashboard-card-info',
    success: 'dashboard-card-success',
  };

  const iconColors = {
    critical: 'text-error-400',
    warning: 'text-warning-400',
    info: 'text-primary-400',
    success: 'text-success-400',
  };

  return (
    <div
      className={`${variantClasses[variant]} group relative overflow-hidden`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Background gradient glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl rounded-full bg-current" />

      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          {title}
        </h4>
        <Icon className={`w-6 h-6 ${iconColors[variant]} group-hover:scale-110 transition-transform duration-300`} />
      </div>

      {/* Main value */}
      <div className="relative z-10">
        <p className="text-5xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
          {value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-400 mb-2">
            {subtitle}
          </p>
        )}

        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend.positive ? 'text-success-400' : 'text-error-400'
          }`}>
            <span>{trend.positive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
    </div>
  );
}
