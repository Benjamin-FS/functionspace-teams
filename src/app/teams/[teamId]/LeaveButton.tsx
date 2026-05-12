'use client';

import { useRouter } from 'next/navigation';

export function LeaveButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="link-button muted"
      onClick={async () => {
        if (!confirm('Leave this guild?')) return;
        await fetch(`/api/teams/${teamId}/leave`, { method: 'POST' });
        router.refresh();
        router.push('/teams');
      }}
    >
      Leave guild
    </button>
  );
}
