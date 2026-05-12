'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? 'Join failed');
      setBusy(false);
      return;
    }
    router.refresh();
    router.push(`/teams/${data.team.id}`);
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="invite code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        required
        style={{ textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center' }}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={busy}>
        {busy ? 'Joining…' : 'Join guild'}
      </button>
    </form>
  );
}
