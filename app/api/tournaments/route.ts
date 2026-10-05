import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        game: true,
        stages: {
          include: {
            matches: true,
          },
        },
        participants: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        gameId: body.gameId,
        organizer: body.organizer,
        tier: body.tier,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location,
        prizePool: body.prizePool ? parseInt(body.prizePool) : null,
        status: body.status || 'UPCOMING',
        description: body.description,
      },
      include: {
        game: true,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}
