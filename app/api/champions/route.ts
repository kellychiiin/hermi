import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const completedTournaments = await prisma.tournament.findMany({
      where: { status: 'COMPLETED' },
      include: {
        participants: {
          where: { placement: 1 },
          include: {
            team: {
              include: {
                rosterMemberships: {
                  include: {
                    player: {
                      include: {
                        game: true,
                      },
                    },
                  },
                  where: {
                    endDate: null,
                  },
                },
                game: true,
              },
            },
          },
        },
        game: true,
      },
    });

    const championMap = new Map<
      string,
      {
        id: string;
        handle: string;
        realName: string | null;
        photo: string | null;
        championships: Array<{
          gameId: string;
          gameName: string;
          count: number;
        }>;
      }
    >();

    for (const tournament of completedTournaments) {
      for (const participant of tournament.participants) {
        for (const membership of participant.team.rosterMemberships) {
          const player = membership.player;
          const key = player.id;

          if (!championMap.has(key)) {
            championMap.set(key, {
              id: player.id,
              handle: player.handle,
              realName: player.realName,
              photo: player.photo,
              championships: [],
            });
          }

          const championData = championMap.get(key)!;
          const gameChampionship = championData.championships.find(
            (c) => c.gameId === player.game.id
          );

          if (gameChampionship) {
            gameChampionship.count++;
          } else {
            championData.championships.push({
              gameId: player.game.id,
              gameName: player.game.name,
              count: 1,
            });
          }
        }
      }
    }

    const champions = Array.from(championMap.values()).sort((a, b) => {
      const aTotalChampionships = a.championships.reduce((sum, c) => sum + c.count, 0);
      const bTotalChampionships = b.championships.reduce((sum, c) => sum + c.count, 0);
      return bTotalChampionships - aTotalChampionships;
    });

    return Response.json(champions);
  } catch (error) {
    console.error('Error fetching champions:', error);
    return Response.json({ error: 'Failed to fetch champions' }, { status: 500 });
  }
}
