'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'cyan';
}

const colorClasses = {
  blue: 'from-police-blue to-police-blue-light',
  purple: 'from-accent-purple to-police-blue',
  green: 'from-accent-green to-accent-cyan',
  red: 'from-accent-red to-accent-orange',
  orange: 'from-accent-orange to-accent-red',
  cyan: 'from-accent-cyan to-police-blue-light',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-6 card-hover group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            trend.isPositive ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>

      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-dark-400">{title}</p>
    </motion.div>
  );
}
