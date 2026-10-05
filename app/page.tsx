'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check authentication from cookies
    const cookies = document.cookie.split('; ').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {});

    setIsAuthenticated(cookies.isAuthenticated === 'true');
    setUserRole(cookies.userRole || null);
  }, []);

  const handleLogout = () => {
    document.cookie = 'isAuthenticated=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Hermi</h1>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                {userRole === 'admin' && (
                  <Link href="/admin" className="text-white hover:text-indigo-200">
                    Organizer Panel
                  </Link>
                )}
                <Link href="/tournaments" className="text-white hover:text-indigo-200">
                  Tournaments
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-indigo-200">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center text-white">
          <h2 className="text-5xl font-bold mb-6">
            Tournament Organizer
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Manage Dota 2 and Valorant tournaments with ease
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/tournaments"
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50"
                >
                  View Tournaments
                </Link>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10"
                  >
                    Organizer Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-3">Create Tournaments</h3>
            <p className="text-indigo-100">
              Set up single/double elimination brackets and manage team registration
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-3">Track Results</h3>
            <p className="text-indigo-100">
              Enter match results and automatically advance winners through brackets
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-3">Public Pages</h3>
            <p className="text-indigo-100">
              Share tournament info and standings with spectators and participants
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
