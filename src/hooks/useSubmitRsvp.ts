import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import {
  rsvpErrorResponseSchema,
  rsvpSuccessResponseSchema,
  type RsvpErrorCode,
  type RsvpRequest,
  type RsvpSuccessResponse,
} from '@/schemas/guest';

export class RsvpApiError extends Error {
  readonly code: RsvpErrorCode;

  constructor(code: RsvpErrorCode) {
    super(code);
    this.name = 'RsvpApiError';
    this.code = code;
  }
}

async function submitRsvp(input: RsvpRequest): Promise<RsvpSuccessResponse> {
  const response = await fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    throw new RsvpApiError(rsvpErrorResponseSchema.parse(body).code);
  }

  return rsvpSuccessResponseSchema.parse(body);
}

export function useSubmitRsvp(): UseMutationResult<RsvpSuccessResponse, Error, RsvpRequest> {
  return useMutation({ mutationFn: submitRsvp });
}
