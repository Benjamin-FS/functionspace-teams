import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { NewTeamForm } from './NewTeamForm';

export default async function NewTeamPage() {
  const session = await getSession();
  if (!session.username) redirect('/login');
  return (
    <>
      <section className="banner">
        <h1>Found a Guild</h1>
        <div className="tag">
          Choose a name. Pen a motto. Thy seal of summoning shall be drawn at
          once.
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NewTeamForm />
      </div>
    </>
  );
}
