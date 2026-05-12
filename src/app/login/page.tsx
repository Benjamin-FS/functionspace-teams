import { LoginForm } from './LoginForm';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();
  if (session.username) redirect('/');
  return (
    <>
      <section className="banner">
        <h1>Sign in</h1>
        <div className="tag">
          Use your functionSPACE username. First-time users are signed up
          automatically.
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LoginForm />
      </div>
    </>
  );
}
