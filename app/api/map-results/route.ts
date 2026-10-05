import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const matchId = request.nextUrl.searchParams.get('matchId');

    const mapResults = await prisma.mapResult.findMany({
      where: matchId ? { matchId } : undefined,
      include: {
        match: true,
      },
      orderBy: {
        mapOrder: 'asc',
      },
    });

    return NextResponse.json(mapResults);
  } catch (error) {
    console.error('Error fetching map results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mapResult = await prisma.mapResult.create({
      data: {
        matchId: body.matchId,
        mapName: body.mapName,
        mapOrder: body.mapOrder,
        scoreA: body.scoreA,
        scoreB: body.scoreB,
        winner: body.winner,
      },
      include: {
        match: true,
      },
    });

    return NextResponse.json(mapResult, { status: 201 });
  } catch (error) {
    console.error('Error creating map result:', error);
    return NextResponse.json(
      { error: 'Failed to create map result' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const mapResult = await prisma.mapResult.update({
      where: { id: body.id },
      data: {
        scoreA: body.scoreA,
        scoreB: body.scoreB,
        winner: body.winner,
      },
      include: {
        match: true,
      },
    });

    return NextResponse.json(mapResult);
  } catch (error) {
    console.error('Error updating map result:', error);
    return NextResponse.json(
      { error: 'Failed to update map result' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.mapResult.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting map result:', error);
    return NextResponse.json(
      { error: 'Failed to delete map result' },
      { status: 500 }
    );
  }
}
