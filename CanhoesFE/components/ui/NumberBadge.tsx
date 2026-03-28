/**
 * NumberBadge — Badge numérico estilizado
 * 
 * Pequeno círculo com número, usado para contadores e stats.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/theme/tokens';

interface NumberBadgeProps {
  value: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function NumberBadge({
  value,
  color = colors.psycho,
  size = 'md',
  className,
  animated = false,
}: NumberBadgeProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 text-[10px]',
    md: 'h-6 w-6 text-xs',
    lg: 'h-8 w-8 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold font-mono',
        sizeClasses[size],
        animated && 'animate-pulse',
        className
      )}
      style={{
        backgroundColor: color,
        color: colors.textPrimary,
        minWidth: size === 'sm' ? '20px' : size === 'lg' ? '32px' : '24px',
      }}
    >
      {value}
    </span>
  );
}
