-- CreateTable: player_games (many-to-many relationship)
CREATE TABLE "player_games" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_games_pkey" PRIMARY KEY ("id")
);

-- Migrate existing player-game relationships
INSERT INTO "player_games" ("id", "playerId", "gameId", "createdAt", "updatedAt")
SELECT
    concat('pg_', "id"),
    "id",
    "gameId",
    "createdAt",
    "updatedAt"
FROM "players"
WHERE "gameId" IS NOT NULL;

-- Drop the foreign key constraint on players.gameId
ALTER TABLE "players" DROP CONSTRAINT "players_gameId_fkey";

-- Drop the unique constraint on (gameId, handle)
ALTER TABLE "players" DROP CONSTRAINT "players_gameId_handle_key";

-- Drop the gameId column from players
ALTER TABLE "players" DROP COLUMN "gameId";

-- Add unique constraint on handle
ALTER TABLE "players" ADD CONSTRAINT "players_handle_key" UNIQUE ("handle");

-- Create indexes for player_games
CREATE UNIQUE INDEX "player_games_playerId_gameId_key" ON "player_games"("playerId", "gameId");
CREATE INDEX "player_games_playerId_idx" ON "player_games"("playerId");
CREATE INDEX "player_games_gameId_idx" ON "player_games"("gameId");

-- AddForeignKey constraints
ALTER TABLE "player_games" ADD CONSTRAINT "player_games_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_games" ADD CONSTRAINT "player_games_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
