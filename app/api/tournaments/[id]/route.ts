import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        game: true,
        stages: {
          include: {
            matches: {
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
            },
            participants: {
              include: {
                team: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        participants: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const tournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        name: body.name,
        organizer: body.organizer,
        tier: body.tier,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location,
        prizePool: body.prizePool ? parseInt(body.prizePool) : null,
        status: body.status,
        description: body.description,
      },
    });

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.tournament.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}
