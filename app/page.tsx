import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Hermi</h1>
          <div className="flex gap-4">
            <Link href="/tournaments" className="text-white hover:text-indigo-200">
              Tournaments
            </Link>
            <Link href="/admin" className="text-white hover:text-indigo-200">
              Admin
            </Link>
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
            <Link
              href="/tournaments"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50"
            >
              View Tournaments
            </Link>
            <Link
              href="/admin"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10"
            >
              Organizer Panel
            </Link>
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
