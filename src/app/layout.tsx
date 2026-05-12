import type { Metadata } from 'next';
import Link from 'next/link';
import { Cinzel, IM_Fell_English } from 'next/font/google';
import { FSProviders } from '@/components/FSProviders';
import { getSession } from '@/lib/session';
import { LogoutButton } from '@/components/LogoutButton';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const imFell = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-imfell',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'functionSPACE Guilds',
  description: 'Form guilds and aggregate prediction-market positions',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="en" className={`${cinzel.variable} ${imFell.variable}`}>
      <body>
        <FSProviders
          token={session.token ?? null}
          username={session.username ?? null}
        >
          <header className="site-header">
            <Link href="/" className="logo">
              functionSPACE <span className="swash">Guilds</span>
            </Link>
            <nav>
              <Link href="/teams">Guilds</Link>
              <Link href="/markets">Markets</Link>
              {session.username ? (
                <>
                  <span className="user-chip">{session.username}</span>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login">Sign in</Link>
              )}
            </nav>
          </header>
          <main className="site-main">{children}</main>
        </FSProviders>
      </body>
    </html>
  );
}
