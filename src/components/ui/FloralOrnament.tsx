import type { ReactNode } from 'react';

interface FloralOrnamentProps {
  src: string;
  className?: string;
  isPriority?: boolean;
}

export const FloralOrnament = ({
  src,
  className,
  isPriority = false,
}: FloralOrnamentProps): ReactNode => {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading={isPriority ? 'eager' : 'lazy'}
      className={className}
    />
  );
};
