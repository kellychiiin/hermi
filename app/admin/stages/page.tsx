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

const STAGE_TYPES = [
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
  'GROUP',
];

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    order: 1,
    type: 'SINGLE_ELIMINATION',
    bestOf: 3,
    tournamentId: '',
  });

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
          setFormData((prev) => ({
            ...prev,
            tournamentId: tournamentsData[0].id,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' || name === 'bestOf' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create stage');

      const newStage = await res.json();
      setStages((prev) => [...prev, newStage]);
      setFormData({
        name: '',
        order: 1,
        type: 'SINGLE_ELIMINATION',
        bestOf: 3,
        tournamentId: formData.tournamentId,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating stage:', error);
      alert('Failed to create stage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (stageId: string) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;

    try {
      const res = await fetch('/api/stages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: stageId }),
      });

      if (!res.ok) throw new Error('Failed to delete stage');

      setStages((prev) => prev.filter((s) => s.id !== stageId));
    } catch (error) {
      console.error('Error deleting stage:', error);
      alert('Failed to delete stage');
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Manage Stages</h1>
            <p className="text-indigo-100">Add stages to your tournaments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            {showForm ? '✕ Cancel' : '+ Add Stage'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tournament *
                  </label>
                  <select
                    name="tournamentId"
                    value={formData.tournamentId}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  >
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="e.g., Group Stage, Playoffs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Order *
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  >
                    {STAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Best Of
                  </label>
                  <input
                    type="number"
                    name="bestOf"
                    value={formData.bestOf}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                >
                  {submitting ? 'Creating...' : 'Create Stage'}
                </button>
              </div>
            </form>
          </div>
        )}

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
                  <button
                    onClick={() => handleDelete(stage.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
