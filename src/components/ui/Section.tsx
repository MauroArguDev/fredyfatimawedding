import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const Section = ({ id, children, className }: SectionProps): ReactNode => {
  const classes = ['w-full', 'px-6', 'py-10'];
  if (className !== undefined) {
    classes.push(className);
  }

  return (
    <section id={id} className={classes.join(' ')}>
      {children}
    </section>
  );
};
