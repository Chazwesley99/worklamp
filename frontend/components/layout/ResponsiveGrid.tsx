import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'minimal' | 'compact' | 'cozy' | 'default';
}

/**
 * ResponsiveGrid - A responsive grid layout component with minimal spacing
 *
 * Requirement 18.4: Use minimal padding and gaps for space efficiency
 * Requirement 18.5: Render responsive layouts optimized for mobile devices
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'compact',
}: ResponsiveGridProps) {
  const gapClasses = {
    minimal: 'gap-tight',
    compact: 'gap-compact',
    cozy: 'gap-cozy',
    default: 'gap-4',
  };

  const colClasses = cn(
    'grid',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );

  return <div className={cn(colClasses, gapClasses[gap], className)}>{children}</div>;
}
