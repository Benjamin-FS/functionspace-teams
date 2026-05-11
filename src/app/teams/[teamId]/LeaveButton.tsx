'use client';

import { useRouter } from 'next/navigation';

export function LeaveButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="link-button muted"
      onClick={async () => {
        if (!confirm('Break thy oath and depart this guild?')) return;
        await fetch(`/api/teams/${teamId}/leave`, { method: 'POST' });
        router.refresh();
        router.push('/teams');
      }}
    >
      Forsake the oath
    </button>
  );
}
