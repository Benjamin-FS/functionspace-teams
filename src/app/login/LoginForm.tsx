'use client';

import { useState } from 'react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Login failed');
      setBusy(false);
      return;
    }
    // Hard navigation forces the layout (and its session-aware header) to
    // re-render against the cookie we just set. `router.push + refresh` is
    // racy across auth state changes on Next 14 App Router.
    window.location.href = '/';
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Username
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={32}
          autoFocus
        />
      </label>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
        New username? An account will be created automatically.
      </p>
    </form>
  );
}
