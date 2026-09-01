import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { publicInvitationSchema, type PublicInvitation } from '@/schemas/guest';

const HTTP_NOT_FOUND = 404;
const MAX_AUTOMATIC_RETRIES = 1;

export class InvitationNotFoundError extends Error {
  constructor(token: string) {
    super(`Invitation not found for token: ${token}`);
    this.name = 'InvitationNotFoundError';
  }
}

async function fetchInvitation(token: string): Promise<PublicInvitation> {
  const response = await fetch(`/api/invitation/${encodeURIComponent(token)}`);

  if (response.status === HTTP_NOT_FOUND) {
    throw new InvitationNotFoundError(token);
  }

  if (!response.ok) {
    throw new Error(`Unexpected invitation response status: ${String(response.status)}`);
  }

  return publicInvitationSchema.parse(await response.json());
}

export function useInvitation(token: string): UseQueryResult<PublicInvitation> {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => fetchInvitation(token),
    enabled: token.length > 0,
    retry: (failureCount, error) =>
      !(error instanceof InvitationNotFoundError) && failureCount < MAX_AUTOMATIC_RETRIES,
  });
}
