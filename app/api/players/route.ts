import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const players = await prisma.player.findMany({
      include: {
        game: true,
        rosterMemberships: {
          include: {
            team: {
              include: {
                game: true,
              },
            },
          },
        },
      },
      orderBy: {
        handle: 'asc',
      },
    });

    const playersWithGames = players.map((player) => {
      const gamesSet = new Map<string, { id: string; name: string }>();

      gamesSet.set(player.game.id, { id: player.game.id, name: player.game.name });

      player.rosterMemberships.forEach((membership) => {
        if (!gamesSet.has(membership.team.game.id)) {
          gamesSet.set(membership.team.game.id, {
            id: membership.team.game.id,
            name: membership.team.game.name,
          });
        }
      });

      return {
        ...player,
        games: Array.from(gamesSet.values()),
      };
    });

    return NextResponse.json(playersWithGames);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const player = await prisma.player.create({
      data: {
        handle: body.handle,
        realName: body.realName,
        country: body.country,
        photo: body.photo,
        gameId: body.gameId,
      },
      include: {
        game: true,
        rosterMemberships: {
          include: {
            team: {
              include: {
                game: true,
              },
            },
          },
        },
      },
    });

    const gamesSet = new Map<string, { id: string; name: string }>();
    gamesSet.set(player.game.id, { id: player.game.id, name: player.game.name });
    player.rosterMemberships.forEach((membership) => {
      if (!gamesSet.has(membership.team.game.id)) {
        gamesSet.set(membership.team.game.id, {
          id: membership.team.game.id,
          name: membership.team.game.name,
        });
      }
    });

    return NextResponse.json(
      { ...player, games: Array.from(gamesSet.values()) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
