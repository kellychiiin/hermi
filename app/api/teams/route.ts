import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');

    const teams = await prisma.team.findMany({
      where: gameId ? { gameId } : undefined,
      include: {
        game: true,
        rosterMemberships: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const team = await prisma.team.create({
      data: {
        name: body.name,
        tag: body.tag,
        logo: body.logo,
        region: body.region,
        gameId: body.gameId,
      },
      include: {
        game: true,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
