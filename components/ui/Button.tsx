'use client';

import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-police-blue to-police-blue-light text-white hover:shadow-lg hover:shadow-police-blue/50',
  secondary: 'glass-strong hover:glass text-white',
  danger: 'bg-gradient-to-r from-accent-red to-accent-orange text-white hover:shadow-lg hover:shadow-accent-red/50',
  ghost: 'text-dark-300 hover:text-white hover:bg-white/5',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        rounded-xl font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2 justify-center
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </button>
  );
}
