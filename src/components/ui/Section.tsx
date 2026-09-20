import { useRef, type ReactNode } from 'react';
import { m, useInView, useReducedMotion } from 'framer-motion';

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

const VIEWPORT_MARGIN = '0px 0px -10% 0px';
const ENTRANCE_OFFSET_PX = 16;
const ENTRANCE_DURATION_S = 0.5;

export const Section = ({ id, children, className }: SectionProps): ReactNode => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: VIEWPORT_MARGIN });
  const shouldReduceMotion = useReducedMotion();

  const classes = ['w-full', 'px-6', 'py-10'];
  if (className !== undefined) {
    classes.push(className);
  }

  const variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : ENTRANCE_OFFSET_PX },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <m.section
      id={id}
      ref={ref}
      className={classes.join(' ')}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: ENTRANCE_DURATION_S, ease: 'easeOut' }}
    >
      {children}
    </m.section>
  );
};
