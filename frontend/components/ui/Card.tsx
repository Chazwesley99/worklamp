import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'minimal' | 'compact' | 'cozy' | 'default';
  interactive?: boolean;
}

/**
 * Card - A card component with minimal spacing and theme support
 *
 * Requirement 18.4: Use minimal padding and gaps for space efficiency
 * Requirement 18.6: Require minimal clicks to complete tasks (interactive variant)
 */
export function Card({
  children,
  className,
  padding = 'compact',
  interactive = false,
  ...props
}: CardProps) {
  const paddingClasses = {
    minimal: 'p-tight',
    compact: 'p-compact',
    cozy: 'p-cozy',
    default: 'p-4',
  };

  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg border border-border',
        paddingClasses[padding],
        interactive && 'cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('flex flex-col gap-tight', className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('pt-compact', className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('flex items-center gap-compact pt-compact', className)}>{children}</div>
  );
}
