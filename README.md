# Hermi - Tournament Organizer

A tournament organizer web app for Dota 2 and Valorant, similar to Liquipedia but designed as a tool to create and manage your own tournaments.

## Features

- **Create Tournaments**: Set up tournaments with single/double elimination brackets
- **Manage Teams & Players**: Add teams, manage rosters, and track player histories
- **Match Management**: Enter match results and automatically advance winners
- **Public Pages**: Share tournament info, brackets, and standings
- **Multi-Game**: Support for Dota 2, Valorant, and other games

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + React 18 + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (for invite-only editors)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kellychiiin/hermi.git
cd hermi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/hermi"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
hermi/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/               # API routes (to be built)
├── prisma/
│   └── schema.prisma      # Database schema
├── components/            # Reusable React components (to be built)
├── lib/                   # Utility functions (to be built)
└── public/               # Static assets
```

## Database Schema

The app uses Prisma ORM with a PostgreSQL database. Key models include:

- **Game**: Dota 2, Valorant, etc.
- **Team**: Organizations/teams
- **Player**: Individual players
- **Tournament**: Tournament events
- **Stage**: Groups/brackets within a tournament
- **Match**: Individual games/matches
- **MapResult**: Map-by-map results

## Roadmap

### MVP (Current)
- [ ] Basic tournament creation
- [ ] Single/double elimination bracket generation
- [ ] Match result entry with auto-advance
- [ ] Public tournament and team pages

### Phase 2
- [ ] Player profiles and roster history
- [ ] Group stages and Swiss format
- [ ] Tournament search and filtering
- [ ] Organizer sign-up system

### Phase 3
- [ ] Stats and leaderboards
- [ ] Live score updates
- [ ] API for third-party integrations
- [ ] Custom branding per tournament

## Contributing

This is a personal project for tournament organization. Contributions welcome!

## License

MIT
