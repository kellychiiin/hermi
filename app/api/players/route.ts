import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');

    const players = await prisma.player.findMany({
      where: gameId ? { gameId } : undefined,
      include: {
        game: true,
        rosterMemberships: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        handle: 'asc',
      },
    });

    return NextResponse.json(players);
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
            team: true,
          },
        },
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
