import { FSClient } from '@functionspace/core';
import { getSession } from './session';

export const FS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONSPACE_API_URL!;

if (!FS_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_FUNCTIONSPACE_API_URL is not set; copy .env.example to .env and configure it.',
  );
}

export function getGuestClient(): FSClient {
  return new FSClient({ baseUrl: FS_BASE_URL });
}

export async function getServerClient(): Promise<{
  client: FSClient;
  username: string | null;
}> {
  const session = await getSession();
  const client = new FSClient({ baseUrl: FS_BASE_URL });
  if (session.token) client.setToken(session.token);
  return { client, username: session.username ?? null };
}
