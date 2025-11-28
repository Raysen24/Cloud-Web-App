import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logEvent } from '@/lib/metrics';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty') ?? 'easy';

  // Get sessions ordered by best time first
  const sessions = await prisma.gameSession.findMany({
    where: { difficulty },
    orderBy: { timeTaken: 'asc' },
    include: { user: true },
  });

  // Keep only the best session per user
  const seenUsers = new Set<number>();
  const distinct: typeof sessions = [];
  for (const s of sessions) {
    if (seenUsers.has(s.userId)) continue;
    seenUsers.add(s.userId);
    distinct.push(s);
    if (distinct.length >= 10) break;
  }

  const leaderboard = distinct.map((row, index) => ({
    rank: index + 1,
    player: row.user.displayName,
    timeTaken: row.timeTaken,
    finishedAt: row.finishedAt,
  }));

  logEvent('leaderboard_view', {
    difficulty,
    entries: leaderboard.length,
  });

  return NextResponse.json({ difficulty, leaderboard });
}
