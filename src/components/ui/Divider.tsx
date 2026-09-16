import type { ReactNode } from 'react';

interface DividerProps {
  className?: string;
}

export const Divider = ({ className }: DividerProps): ReactNode => {
  const classes = ['h-px', 'w-full', 'bg-accent-coral'];
  if (className !== undefined) {
    classes.push(className);
  }

  return <hr className={classes.join(' ')} />;
};
