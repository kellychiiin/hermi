'use server';

import { cookies } from 'next/headers';

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

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete('isAuthenticated');
  cookieStore.delete('userRole');
}
