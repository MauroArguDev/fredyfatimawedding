import type { ReactNode } from 'react';

export type CardVariant = 'dark' | 'sage' | 'muted';

interface CardProps {
  variant: CardVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  dark: 'bg-surface-dark text-text-on-dark',
  sage: 'bg-surface-sage text-text-on-sage',
  muted: 'bg-surface-muted text-text-body',
};

export const Card = ({ variant, children, className }: CardProps): ReactNode => {
  const classes = ['rounded-invitation-sm', 'p-4', VARIANT_CLASSES[variant]];
  if (className !== undefined) {
    classes.push(className);
  }

  return <div className={classes.join(' ')}>{children}</div>;
};
