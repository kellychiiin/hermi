import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const completedTournaments = await prisma.tournament.findMany({
      where: { status: 'COMPLETED' },
      include: {
        stages: {
          include: {
            matches: {
              include: {
                participants: {
                  include: {
                    participant: {
                      include: {
                        team: {
                          include: {
                            rosterMemberships: {
                              include: {
                                player: {
                                  include: {
                                    playerGames: {
                                      include: {
                                        game: true,
                                      },
                                    },
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
                  },
                },
              },
            },
          },
        },
        participants: {
          include: {
            team: {
              include: {
                rosterMemberships: {
                  include: {
                    player: {
                      include: {
                        playerGames: {
                          include: {
                            game: true,
                          },
                        },
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
      // Find tournament winner from final match
      let winnerTeam = null;

      // Get the last stage (finals/playoffs)
      if (tournament.stages.length > 0) {
        const lastStage = tournament.stages[tournament.stages.length - 1];

        // Get the last match in the final stage
        if (lastStage.matches.length > 0) {
          const lastMatch = lastStage.matches[lastStage.matches.length - 1];
          if (lastMatch.winner) {
            // Find the winner's team
            const winnerMatchParticipant = lastMatch.participants.find(
              (mp) => mp.participant.id === lastMatch.winner
            );
            if (winnerMatchParticipant) {
              winnerTeam = winnerMatchParticipant.participant.team;
            }
          }
        }
      }

      // If no winner found from matches, try placement field
      if (!winnerTeam && tournament.participants.length > 0) {
        const placement1 = tournament.participants.find((p) => p.placement === 1);
        if (placement1) {
          winnerTeam = placement1.team;
        }
      }

      // Add team champion if found
      if (winnerTeam) {
        teamChampionsList.push({
          id: winnerTeam.id,
          name: winnerTeam.name,
          tag: winnerTeam.tag,
          gameName: tournament.game.name,
          gameId: tournament.game.id,
          logo: winnerTeam.logo,
          tournamentName: tournament.name,
          tournamentId: tournament.id,
          tournamentEndDate: tournament.endDate || tournament.startDate,
        });

        // Add player champions from the winning team
        for (const membership of winnerTeam.rosterMemberships) {
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

          for (const playerGame of player.playerGames) {
            const gameChampionship = championData.championships.find(
              (c) => c.gameId === playerGame.game.id
            );

            if (gameChampionship) {
              gameChampionship.count++;
            } else {
              championData.championships.push({
                gameId: playerGame.game.id,
                gameName: playerGame.game.name,
                count: 1,
              });
            }
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
