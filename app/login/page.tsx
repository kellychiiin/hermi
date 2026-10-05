'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'admin'>('select');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleViewAsUser = () => {
    // Set cookies for authentication
    document.cookie = 'userRole=user; path=/; max-age=86400'; // 1 day
    document.cookie = 'isAuthenticated=true; path=/; max-age=86400';
    router.push('/tournaments');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Simple auth check (in production, this should be done server-side)
    if (adminUsername === 'admin' && adminPassword === 'admin') {
      // Set cookies for authentication
      document.cookie = 'userRole=admin; path=/; max-age=86400'; // 1 day
      document.cookie = 'isAuthenticated=true; path=/; max-age=86400';
      router.push('/admin');
    } else {
      setError('Invalid username or password');
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-bold text-white mb-4 block">
            Hermi
          </Link>
          <p className="text-indigo-200">Tournament Organizer</p>
        </div>

        {mode === 'select' ? (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
              <h1 className="text-2xl font-bold mb-8 text-center">How do you want to access?</h1>

              <div className="space-y-4">
                <button
                  onClick={handleViewAsUser}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition text-lg"
                >
                  👤 View as User
                </button>

                <button
                  onClick={() => setMode('admin')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition text-lg"
                >
                  👨‍💼 Organizer Login
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-indigo-100 text-sm">
              <p className="text-center">
                👤 <strong>User:</strong> View and track tournaments<br />
                👨‍💼 <strong>Organizer:</strong> Create and manage tournaments
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
            <h1 className="text-2xl font-bold mb-6 text-center">Organizer Login</h1>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
                >
                  {submitting ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('select');
                    setError('');
                    setAdminUsername('');
                    setAdminPassword('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-indigo-400/20">
              <p className="text-center text-xs text-indigo-300">
                💡 Demo credentials: admin / admin
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
