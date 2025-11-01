'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  outline?: boolean;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  outline = false,
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    success: outline
      ? 'border-2 border-success-600 text-success-600'
      : 'bg-success-600 text-white',
    warning: outline
      ? 'border-2 border-warning-600 text-warning-600'
      : 'bg-warning-600 text-white',
    error: outline
      ? 'border-2 border-error-600 text-error-600'
      : 'bg-error-600 text-white',
    info: outline
      ? 'border-2 border-primary-600 text-primary-600'
      : 'bg-primary-600 text-white',
    neutral: outline
      ? 'border-2 border-gray-600 text-gray-600'
      : 'bg-gray-600 text-white',
  };

  const classes = `px-3 py-1 text-xs font-semibold rounded-full ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
