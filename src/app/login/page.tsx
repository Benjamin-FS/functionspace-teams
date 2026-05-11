import { LoginForm } from './LoginForm';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();
  if (session.username) redirect('/');
  return (
    <>
      <section className="banner">
        <h1>Enter the Realm</h1>
        <div className="tag">
          Speak thy name, traveller. If it is new to these halls, the scribes
          shall enrol thee upon the rolls without ceremony.
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LoginForm />
      </div>
    </>
  );
}
