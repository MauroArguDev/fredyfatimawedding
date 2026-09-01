import type { ReactNode } from 'react';
import { Button } from '@/components/admin/primitives/button';

interface AdminErrorStateProps {
  message: string;
  retry?: {
    label: string;
    onRetry: () => void;
  };
}

export const AdminErrorState = ({ message, retry }: AdminErrorStateProps): ReactNode => {
  return (
    <div
      role="alert"
      className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-destructive"
    >
      <p>{message}</p>
      {retry !== undefined && (
        <Button type="button" variant="outline" onClick={retry.onRetry}>
          {retry.label}
        </Button>
      )}
    </div>
  );
};
