'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SIGILS, Sigil, DEFAULT_SIGIL_ID } from '@/lib/sigils';

export function NewTeamForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [blurb, setBlurb] = useState('');
  const [sigilId, setSigilId] = useState(DEFAULT_SIGIL_ID);
  const [tag, setTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, blurb, sigilId, tag }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? 'Failed to create team');
      setBusy(false);
      return;
    }
    router.push(`/teams/${data.team.id}`);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit} style={{ maxWidth: 480 }}>
      <label>
        Guild Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </label>

      <label>
        Tag <span className="muted">(2–4 letters, optional)</span>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value.toUpperCase().slice(0, 4))}
          pattern="[A-Z0-9]{2,4}"
          maxLength={4}
          placeholder="ORCL"
          style={{ letterSpacing: '0.2em' }}
        />
      </label>

      <label>
        Sigil
        <div className="sigil-picker">
          {SIGILS.map((s) => (
            <button
              key={s.id}
              type="button"
              data-selected={sigilId === s.id}
              onClick={() => setSigilId(s.id)}
              title={s.name}
              aria-label={`Choose ${s.name}`}
            >
              <Sigil id={s.id} size={28} />
            </button>
          ))}
        </div>
      </label>

      <label>
        Motto <span className="muted">(optional)</span>
        <textarea
          rows={3}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="A short tagline for your guild."
        />
      </label>

      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={busy}>
        {busy ? 'Creating…' : 'Create guild'}
      </button>
    </form>
  );
}
