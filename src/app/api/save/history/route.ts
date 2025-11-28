// src/app/api/save/history/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logEvent } from '@/lib/metrics';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    logEvent('get_save_history', { userId: null });
    return NextResponse.json({ history: [] }, { status: 200 });
  }

  const saves = await prisma.saveState.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const history = saves.map((s) => {
    let solvedRooms: Record<string, boolean> = {};
    try {
      solvedRooms = JSON.parse(s.solvedRoomsJson);
    } catch {
      solvedRooms = {};
    }

    return {
      id: s.id,
      difficulty: s.difficulty,
      timeLeft: s.timeLeft,
      currentRoom: s.currentRoom,
      solvedRooms,
      roomStates: s.roomStates ?? undefined,
      createdAt: s.createdAt.toISOString(),
    };
  });

  logEvent('get_save_history', {
    userId: user.id,
    count: history.length,
  });

  return NextResponse.json({ history });
}
