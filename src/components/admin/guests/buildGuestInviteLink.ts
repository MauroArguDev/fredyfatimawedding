export function buildInvitationUrl(origin: string, token: string): string {
  return `${origin}/i/${token}`;
}
