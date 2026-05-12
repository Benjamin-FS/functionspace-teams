'use client';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { FunctionSpaceContext } from '@functionspace/react';

export function LogoutButton() {
  const router = useRouter();
  const ctx = useContext(FunctionSpaceContext);
  return (
    <button
      type="button"
      className="link-button"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        ctx?.logout();
        router.refresh();
        router.push('/');
      }}
    >
      Sign out
    </button>
  );
}
