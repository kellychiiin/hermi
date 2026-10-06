import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let prismaInstance: PrismaClient | undefined;

function getDatabaseUrl(): string {
  // Try Cloudflare Workers context first
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    if (env?.DATABASE_URL) {
      return env.DATABASE_URL;
    }
  } catch (e) {
    // Not in Cloudflare context, fall through
  }

  // Fall back to process.env (local development)
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

export function getPrisma() {
  if (prismaInstance) {
    return prismaInstance;
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const { Pool } = require('@neondatabase/serverless');
  const { PrismaNeon } = require('@prisma/adapter-neon');

  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const adapter = new PrismaNeon(pool);

  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrisma(), prop);
  },
}) as PrismaClient;

// Gracefully handle disconnection
process.on('exit', async () => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
  }
});
