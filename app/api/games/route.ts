import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // If no games exist, create default ones
    if (games.length === 0) {
      const defaultGames = await prisma.game.createMany({
        data: [
          {
            name: 'Dota 2',
            slug: 'dota2',
            logo: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/logo.png',
          },
          {
            name: 'Valorant',
            slug: 'valorant',
            logo: 'https://images.contentstack.io/v3/assets/bltfe521ce715202ef/blt8f4ca2d8cf3a9c4a/63509d0327a5f20ae4e82e6d/val_newlogo.png',
          },
        ],
      });

      return NextResponse.json(
        await prisma.game.findMany({ orderBy: { name: 'asc' } })
      );
    }

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const game = await prisma.game.create({
      data: {
        name: body.name,
        slug: body.slug,
        logo: body.logo,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
