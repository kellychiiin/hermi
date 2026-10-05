import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stageId } = body;

    if (!stageId) {
      return NextResponse.json(
        { error: 'stageId is required' },
        { status: 400 }
      );
    }

    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        participants: {
          orderBy: { seed: 'asc' },
        },
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    if (stage.participants.length < 2) {
      return NextResponse.json(
        { error: 'Stage must have at least 2 participants' },
        { status: 400 }
      );
    }

    const participants = stage.participants;
    const matches = [];

    if (stage.type === 'ROUND_ROBIN' || stage.type === 'GROUP') {
      matches.push(...generateRoundRobin(participants, stage.bestOf || 1));
    } else if (stage.type === 'SINGLE_ELIMINATION') {
      matches.push(...generateSingleElimination(participants, stage.bestOf || 3));
    } else if (stage.type === 'DOUBLE_ELIMINATION') {
      matches.push(...generateDoubleElimination(participants, stage.bestOf || 3));
    } else if (stage.type === 'SWISS') {
      matches.push(...generateSwissRound(participants, 1, stage.bestOf || 3));
    }

    const createdMatches = [];
    for (const match of matches) {
      const created = await prisma.match.create({
        data: {
          stageId,
          round: match.round,
          position: match.position,
          bestOf: match.bestOf,
          status: 'SCHEDULED',
          participants: {
            create: [
              {
                participantId: match.participantAId,
                side: 'A',
              },
              {
                participantId: match.participantBId,
                side: 'B',
              },
            ],
          },
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
          stage: {
            include: {
              tournament: true,
            },
          },
        },
      });
      createdMatches.push(created);
    }

    return NextResponse.json(
      {
        success: true,
        matchesCreated: createdMatches.length,
        matches: createdMatches,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating matches:', error);
    return NextResponse.json(
      { error: 'Failed to generate matches' },
      { status: 500 }
    );
  }
}

function generateRoundRobin(participants: any[], bestOf: number) {
  const matches = [];
  let matchCount = 0;

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        round: 1,
        position: matchCount++,
        participantAId: participants[i].id,
        participantBId: participants[j].id,
        bestOf,
      });
    }
  }

  return matches;
}

function generateSingleElimination(participants: any[], bestOf: number) {
  const matches = [];
  const sorted = [...participants].sort((a, b) => (a.seed || 0) - (b.seed || 0));

  for (let i = 0; i < sorted.length; i += 2) {
    if (i + 1 < sorted.length) {
      matches.push({
        round: 1,
        position: i / 2,
        participantAId: sorted[i].id,
        participantBId: sorted[i + 1].id,
        bestOf,
      });
    }
  }

  return matches;
}

function generateDoubleElimination(participants: any[], bestOf: number) {
  const matches = [];
  const sorted = [...participants].sort((a, b) => (a.seed || 0) - (b.seed || 0));

  for (let i = 0; i < sorted.length; i += 2) {
    if (i + 1 < sorted.length) {
      matches.push({
        round: 1,
        position: i / 2,
        participantAId: sorted[i].id,
        participantBId: sorted[i + 1].id,
        bestOf,
      });
    }
  }

  return matches;
}

function generateSwissRound(participants: any[], roundNum: number, bestOf: number) {
  const matches = [];
  const sorted = [...participants].sort((a, b) => (a.seed || 0) - (b.seed || 0));

  for (let i = 0; i < sorted.length; i += 2) {
    if (i + 1 < sorted.length) {
      matches.push({
        round: roundNum,
        position: i / 2,
        participantAId: sorted[i].id,
        participantBId: sorted[i + 1].id,
        bestOf,
      });
    }
  }

  return matches;
}
