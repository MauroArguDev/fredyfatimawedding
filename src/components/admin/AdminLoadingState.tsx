import type { ReactNode } from 'react';
import { Loader2Icon } from 'lucide-react';

interface AdminLoadingStateProps {
  message: string;
}

export const AdminLoadingState = ({ message }: AdminLoadingStateProps): ReactNode => {
  return (
    <div
      role="status"
      className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2Icon className="animate-spin" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
};
