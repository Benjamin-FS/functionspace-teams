'use client';

import { useContext, useEffect, useRef } from 'react';
import { FunctionSpaceContext } from '@functionspace/react';

export function TokenInjector({
  token,
  username,
  children,
}: {
  token: string | null;
  username: string | null;
  children: React.ReactNode;
}) {
  const ctx = useContext(FunctionSpaceContext);
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!ctx) return;
    if (applied.current === token) return;
    applied.current = token;
    if (token && username) {
      ctx.client.setToken(token);
      ctx.client.setStoredUsername(username);
      ctx.refreshUser().catch(() => {});
    } else {
      ctx.client.clearToken();
      ctx.client.clearStoredUsername();
    }
  }, [token, username, ctx]);

  return <>{children}</>;
}
