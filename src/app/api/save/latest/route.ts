// src/app/api/save/latest/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logEvent } from '@/lib/metrics';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    logEvent('get_latest_save', { userId: null });
    return NextResponse.json({ save: null }, { status: 200 });
  }

  const save = await prisma.saveState.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  if (!save) {
    logEvent('get_latest_save', { userId: user.id, hasSave: false });
    return NextResponse.json({ save: null }, { status: 200 });
  }

  let solvedRooms: Record<string, boolean> = {};
  try {
    solvedRooms = JSON.parse(save.solvedRoomsJson);
  } catch {
    solvedRooms = {};
  }

  const result = {
    id: save.id,
    difficulty: save.difficulty,
    timeLeft: save.timeLeft,
    currentRoom: save.currentRoom,
    solvedRooms,
    roomStates: save.roomStates ?? undefined,
  };

  logEvent('get_latest_save', {
    userId: user.id,
    hasSave: true,
    saveId: save.id,
  });

  return NextResponse.json({ save: result });
}
