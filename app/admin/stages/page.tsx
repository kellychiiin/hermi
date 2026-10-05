'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tournament {
  id: string;
  name: string;
}

interface Stage {
  id: string;
  name: string | null;
  order: number;
  type: string;
  bestOf: number | null;
  tournamentId: string;
  tournament: Tournament;
}

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, stagesRes] = await Promise.all([
          fetch('/api/tournaments'),
          fetch('/api/stages'),
        ]);

        const tournamentsData = await tournamentsRes.json();
        const stagesData = await stagesRes.json();

        setTournaments(tournamentsData);
        setStages(stagesData);

        if (tournamentsData.length > 0) {
          setSelectedTournament(tournamentsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateMatches = async (stageId: string) => {
    if (!confirm('Generate matches for this stage? This will create all matches based on the stage format.')) return;

    try {
      const res = await fetch('/api/matches/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stageId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate matches');
      }

      const result = await res.json();
      alert(`Successfully generated ${result.matchesCreated} matches!`);
    } catch (error) {
      console.error('Error generating matches:', error);
      alert(`Failed to generate matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filteredStages = stages.filter((stage) =>
    selectedTournament ? stage.tournamentId === selectedTournament : true
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
          <Link href="/admin" className="text-white hover:text-indigo-200">
            Back to Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Tournament Stages</h1>
          <p className="text-indigo-100">View all stages • Create stages from tournament edit page</p>
        </div>


        <div className="bg-blue-500/20 border border-blue-400/30 backdrop-blur-lg rounded-lg p-6 text-white mb-8">
          <p className="text-sm">
            💡 <strong>Tip:</strong> Create stages by going to Admin → Tournaments, select a tournament, and use the <strong>Stages tab</strong>.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white mb-8">
          <label className="block text-sm font-semibold mb-2">
            Filter by Tournament
          </label>
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="">All Tournaments</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>

        {filteredStages.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center text-white">
            <p className="text-indigo-200">No stages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStages.map((stage) => (
              <div
                key={stage.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {stage.name || `Stage ${stage.order}`}
                    </h3>
                    <div className="space-y-2 text-sm text-indigo-100">
                      <p>🎮 {stage.tournament.name}</p>
                      <p>
                        📊 {stage.type.replace(/_/g, ' ')} • Stage Order:{' '}
                        {stage.order}
                      </p>
                      {stage.bestOf && <p>🏆 Best of {stage.bestOf}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateMatches(stage.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
                    >
                      Generate Matches
                    </button>
                    <Link
                      href={`/admin/tournaments/${stage.tournament.id}`}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg text-center"
                    >
                      Edit Tournament
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
