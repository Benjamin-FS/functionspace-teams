'use client';

import { FunctionSpaceProvider } from '@functionspace/react';
import { TokenInjector } from './TokenInjector';

export function FSProviders({
  token,
  username,
  children,
}: {
  token: string | null;
  username: string | null;
  children: React.ReactNode;
}) {
  // Browser-side SDK calls go to our own origin; a Next.js rewrite proxies
  // them to the real FS backend (same-origin → no CORS). On the server the
  // value is a placeholder; FSClient is reconstructed on client hydration
  // before any fetch is issued.
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

  return (
    <FunctionSpaceProvider config={{ baseUrl }} theme="fs-dark">
      <TokenInjector token={token} username={username}>
        {children}
      </TokenInjector>
    </FunctionSpaceProvider>
  );
}
