import type { ReactNode } from 'react';

interface AdminLoadingStateProps {
  message: string;
}

export const AdminLoadingState = ({ message }: AdminLoadingStateProps): ReactNode => {
  return (
    <div
      role="status"
      className="flex min-h-40 items-center justify-center text-sm text-muted-foreground"
    >
      <p>{message}</p>
    </div>
  );
};
