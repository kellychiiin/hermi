'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticate(role: 'user' | 'admin') {
  const cookieStore = await cookies();

  // Set authentication cookies server-side
  cookieStore.set('isAuthenticated', 'true', {
    path: '/',
    maxAge: 86400, // 1 day
    httpOnly: false, // Allow client-side access for logout
  });

  cookieStore.set('userRole', role, {
    path: '/',
    maxAge: 86400, // 1 day
    httpOnly: false, // Allow client-side access for logout
  });
}

export async function loginAsUser() {
  const cookieStore = await cookies();

  cookieStore.set('isAuthenticated', 'true', {
    path: '/',
    maxAge: 86400,
    httpOnly: false,
  });

  cookieStore.set('userRole', 'user', {
    path: '/',
    maxAge: 86400,
    httpOnly: false,
  });

  redirect('/tournaments');
}

export async function loginAsAdmin(username: string, password: string) {
  if (username !== 'admin' || password !== 'admin') {
    throw new Error('Invalid username or password');
  }

  const cookieStore = await cookies();

  cookieStore.set('isAuthenticated', 'true', {
    path: '/',
    maxAge: 86400,
    httpOnly: false,
  });

  cookieStore.set('userRole', 'admin', {
    path: '/',
    maxAge: 86400,
    httpOnly: false,
  });

  redirect('/admin');
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete('isAuthenticated');
  cookieStore.delete('userRole');
}
