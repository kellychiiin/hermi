import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get('teamId');

    const memberships = await prisma.rosterMembership.findMany({
      where: teamId ? { teamId } : undefined,
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
        team: {
          include: {
            game: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching roster memberships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roster memberships' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const membership = await prisma.rosterMembership.create({
      data: {
        playerId: body.playerId,
        teamId: body.teamId,
        role: body.role,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
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
        team: {
          include: {
            game: true,
          },
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Error creating roster membership:', error);
    return NextResponse.json(
      { error: 'Failed to create roster membership' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.rosterMembership.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting roster membership:', error);
    return NextResponse.json(
      { error: 'Failed to delete roster membership' },
      { status: 500 }
    );
  }
}
