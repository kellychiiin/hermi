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
      orderBy: {
        endDate: 'desc',
      },
    });

    const playerChampionMap = new Map<
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

    const teamChampionsList: Array<{
      id: string;
      name: string;
      tag: string;
      gameName: string;
      gameId: string;
      logo: string | null;
      tournamentName: string;
      tournamentId: string;
      tournamentEndDate: Date;
    }> = [];

    for (const tournament of completedTournaments) {
      for (const participant of tournament.participants) {
        // Add team champion
        teamChampionsList.push({
          id: participant.team.id,
          name: participant.team.name,
          tag: participant.team.tag,
          gameName: tournament.game.name,
          gameId: tournament.game.id,
          logo: participant.team.logo,
          tournamentName: tournament.name,
          tournamentId: tournament.id,
          tournamentEndDate: tournament.endDate || tournament.startDate,
        });

        // Add player champions
        for (const membership of participant.team.rosterMemberships) {
          const player = membership.player;
          const key = player.id;

          if (!playerChampionMap.has(key)) {
            playerChampionMap.set(key, {
              id: player.id,
              handle: player.handle,
              realName: player.realName,
              photo: player.photo,
              championships: [],
            });
          }

          const championData = playerChampionMap.get(key)!;
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

    const playerChampions = Array.from(playerChampionMap.values()).sort((a, b) => {
      const aTotalChampionships = a.championships.reduce((sum, c) => sum + c.count, 0);
      const bTotalChampionships = b.championships.reduce((sum, c) => sum + c.count, 0);
      return bTotalChampionships - aTotalChampionships;
    });

    return Response.json({ playerChampions, teamChampions: teamChampionsList });
  } catch (error) {
    console.error('Error fetching champions:', error);
    return Response.json({ error: 'Failed to fetch champions' }, { status: 500 });
  }
}
