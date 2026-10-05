'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  handle: string;
  realName: string | null;
  photo: string | null;
}

function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const gdriveLinkMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (gdriveLinkMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdriveLinkMatch[1]}`;
  }
  return url;
}

export default function AllPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/players');
        if (!res.ok) throw new Error('Failed to fetch players');
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Hermi
          </Link>
          <Link href="/tournaments" className="text-white hover:text-indigo-200">
            Back to Tournaments
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">All Players</h1>
          <p className="text-indigo-100">{players.length} players total</p>
        </div>

        {players.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center">
            <p className="text-white text-lg">No players found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="relative rounded-lg overflow-hidden h-72 group bg-gradient-to-br from-indigo-400 to-purple-600 hover:opacity-90 transition"
                style={
                  player.photo
                    ? {
                        backgroundImage: `url(${convertGoogleDriveUrl(player.photo)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}
                }
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                {!player.photo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <div className="text-4xl mb-2">🎮</div>
                      <p className="text-sm">No photo</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <h3 className="text-lg font-bold mb-1">{player.handle}</h3>
                  {player.realName && (
                    <p className="text-sm text-indigo-200">{player.realName}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
