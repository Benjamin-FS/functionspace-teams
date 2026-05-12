import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { NewTeamForm } from './NewTeamForm';

export default async function NewTeamPage() {
  const session = await getSession();
  if (!session.username) redirect('/login');
  return (
    <>
      <section className="banner">
        <h1>Create a Guild</h1>
        <div className="tag">
          Pick a name, sigil, and motto. An invite code is generated
          automatically.
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NewTeamForm />
      </div>
    </>
  );
}
