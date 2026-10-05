import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const stageId = request.nextUrl.searchParams.get('stageId');

    const matches = await prisma.match.findMany({
      where: stageId ? { stageId } : undefined,
      include: {
        participants: {
          include: {
            participant: {
              include: {
                team: true,
              },
            },
          },
        },
        mapResults: true,
        stage: true,
      },
      orderBy: {
        round: 'asc',
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const match = await prisma.match.create({
      data: {
        stageId: body.stageId,
        round: body.round,
        position: body.position,
        bestOf: body.bestOf || 3,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        status: body.status || 'SCHEDULED',
      },
      include: {
        participants: {
          include: {
            participant: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const match = await prisma.match.update({
      where: { id: body.id },
      data: {
        status: body.status,
        winner: body.winner,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
      include: {
        participants: {
          include: {
            participant: {
              include: {
                team: true,
              },
            },
          },
        },
        mapResults: true,
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
