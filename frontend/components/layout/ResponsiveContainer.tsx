import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'minimal' | 'compact' | 'cozy' | 'default';
}

/**
 * ResponsiveContainer - A container component that implements minimal spacing
 * and mobile-responsive design principles
 *
 * Requirement 18.4: Use minimal padding and gaps for space efficiency
 * Requirement 18.5: Render responsive layouts optimized for touch interaction
 */
export function ResponsiveContainer({
  children,
  className,
  spacing = 'compact',
}: ResponsiveContainerProps) {
  const spacingClasses = {
    minimal: 'p-tight gap-tight',
    compact: 'p-compact gap-compact',
    cozy: 'p-cozy gap-cozy',
    default: 'p-4 gap-4',
  };

  return (
    <div
      className={cn('w-full mx-auto', 'max-w-7xl', spacingClasses[spacing], 'md:p-6', className)}
    >
      {children}
    </div>
  );
}
