'use client';

import { useContext } from 'react';
import { FunctionSpaceContext } from '@functionspace/react';

export function LogoutButton() {
  const ctx = useContext(FunctionSpaceContext);
  return (
    <button
      type="button"
      className="link-button"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        ctx?.logout();
        // Hard navigation so the layout re-renders without the session cookie.
        window.location.href = '/';
      }}
    >
      Sign out
    </button>
  );
}
