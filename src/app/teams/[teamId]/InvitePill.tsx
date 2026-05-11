'use client';

import { useState } from 'react';

export function InvitePill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copy-pill"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Click to copy"
      style={{ cursor: 'pointer', background: 'transparent', color: 'inherit', font: 'inherit' }}
    >
      <span className="muted" style={{ fontSize: '0.7rem' }}>seal</span>
      <span className="invite">{code}</span>
      <span className="muted" style={{ fontSize: '0.7rem' }}>{copied ? 'taken' : 'copy'}</span>
    </button>
  );
}
