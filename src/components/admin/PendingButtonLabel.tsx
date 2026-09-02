import type { ReactNode } from 'react';
import { Loader2Icon } from 'lucide-react';

interface PendingButtonLabelProps {
  isPending: boolean;
  pendingLabel: string;
  label: string;
}

export const PendingButtonLabel = ({
  isPending,
  pendingLabel,
  label,
}: PendingButtonLabelProps): ReactNode => (
  <>
    {isPending && <Loader2Icon className="animate-spin" aria-hidden="true" />}
    {isPending ? pendingLabel : label}
  </>
);
