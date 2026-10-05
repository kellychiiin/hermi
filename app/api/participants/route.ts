import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const stageId = request.nextUrl.searchParams.get('stageId');
    const tournamentId = request.nextUrl.searchParams.get('tournamentId');

    const participants = await prisma.participant.findMany({
      where: {
        ...(stageId && { stageId }),
        ...(tournamentId && { tournamentId }),
      },
      include: {
        team: {
          include: {
            game: true,
          },
        },
        stage: true,
        tournament: true,
      },
      orderBy: {
        seed: 'asc',
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const participant = await prisma.participant.create({
      data: {
        stageId: body.stageId || null,
        tournamentId: body.tournamentId,
        teamId: body.teamId,
        seed: body.seed,
        placement: body.placement || null,
        prize: body.prize || null,
      },
      include: {
        team: {
          include: {
            game: true,
          },
        },
        stage: true,
        tournament: true,
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const participant = await prisma.participant.update({
      where: { id: body.id },
      data: {
        stageId: body.stageId || null,
        seed: body.seed,
        placement: body.placement,
        prize: body.prize,
      },
      include: {
        team: {
          include: {
            game: true,
          },
        },
        stage: true,
        tournament: true,
      },
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.participant.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    );
  }
}
