'use server';

import { cookies } from 'next/headers';

const AUTH_COOKIE = 'tf_session';

export async function setSession(token: string, user: any) {
  const cookieStore = await cookies();

  // Set the authentication cookie
  // Expires in 7 days
  cookieStore.set(AUTH_COOKIE, JSON.stringify({ token, user }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE);

  if (!session) return null;

  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}
