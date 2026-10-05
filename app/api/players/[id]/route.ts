import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const player = await prisma.player.findUnique({
      where: { id },
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

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

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

    return NextResponse.json({ ...player, games: Array.from(gamesSet.values()) });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    const player = await prisma.player.update({
      where: { id },
      data: {
        handle: body.handle,
        realName: body.realName || null,
        country: body.country || null,
        photo: body.photo || null,
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

    return NextResponse.json({ ...player, games: Array.from(gamesSet.values()) });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.player.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
