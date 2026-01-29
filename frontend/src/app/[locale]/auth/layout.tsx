import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthLayoutClient } from './auth-layout-client';

const AUTH_COOKIE = 'tf_session';

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE);

  // If user is already authenticated, don't let them see auth pages
  if (sessionCookie) {
    redirect(`/${locale}/dashboard`);
  }

  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
