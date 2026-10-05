import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tournamentId = request.nextUrl.searchParams.get('tournamentId');

    const stages = await prisma.stage.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        tournament: true,
        participants: {
          include: {
            team: true,
          },
        },
        matches: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stage = await prisma.stage.create({
      data: {
        tournamentId: body.tournamentId,
        name: body.name,
        order: body.order,
        type: body.type,
        bestOf: body.bestOf,
      },
      include: {
        tournament: true,
        participants: {
          include: {
            team: true,
          },
        },
        matches: true,
      },
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      { error: 'Failed to create stage' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const stage = await prisma.stage.update({
      where: { id: body.id },
      data: {
        name: body.name,
        type: body.type,
        bestOf: body.bestOf,
      },
      include: {
        tournament: true,
        participants: {
          include: {
            team: true,
          },
        },
        matches: true,
      },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.stage.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { error: 'Failed to delete stage' },
      { status: 500 }
    );
  }
}
