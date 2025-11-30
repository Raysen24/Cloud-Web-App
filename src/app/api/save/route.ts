// src/app/api/save/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logEvent } from '@/lib/metrics';

// CREATE / UPDATE (upsert)
// CREATE / UPDATE a specific run (per-run save)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    logEvent('save_progress', { userId: null, error: 'not_logged_in' });
    return NextResponse.json(
      { error: 'Not logged in' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const {
    difficulty,
    timeLeft,
    currentRoom,
    solvedRooms,
    roomStates,
    saveId: rawSaveId, // NEW: optional id of the run we are continuing
  } = body;

  if (
    typeof difficulty !== 'string' ||
    typeof timeLeft !== 'number' ||
    typeof currentRoom !== 'number'
  ) {
    logEvent('save_progress', {
      userId: user.id,
      error: 'invalid_payload',
    });
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }

  const saveId =
    typeof rawSaveId === 'number' ? rawSaveId : undefined;

  const solvedRoomsJson = JSON.stringify(solvedRooms ?? {});
  const roomStatesJson = roomStates ?? null;

  let save;

  if (saveId != null) {
    // Try to update an existing save belonging to this user
    const existing = await prisma.saveState.findUnique({
      where: { id: saveId },
    });

    if (existing && existing.userId === user.id) {
      save = await prisma.saveState.update({
        where: { id: saveId },
        data: {
          difficulty,
          timeLeft,
          currentRoom,
          solvedRoomsJson,
          roomStates: roomStatesJson,
        },
      });
    } else {
      // If not found or not owned, fall back to creating a new run
      save = await prisma.saveState.create({
        data: {
          userId: user.id,
          difficulty,
          timeLeft,
          currentRoom,
          solvedRoomsJson,
          roomStates: roomStatesJson,
        },
      });
    }
  } else {
    // No id passed → new run → create new history entry
    save = await prisma.saveState.create({
      data: {
        userId: user.id,
        difficulty,
        timeLeft,
        currentRoom,
        solvedRoomsJson,
        roomStates: roomStatesJson,
      },
    });
  }

  logEvent('save_progress', {
    userId: user.id,
    difficulty,
    timeLeft,
    currentRoom,
    saveId: save.id,
  });

  return NextResponse.json({ id: save.id });
}

// READ: list all saves for the current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    logEvent('get_save_history', { userId: null, error: 'not_logged_in' });
    return NextResponse.json(
      { error: 'Not logged in' },
      { status: 401 }
    );
  }

  const saves = await prisma.saveState.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const result = saves.map((s) => {
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
    count: result.length,
  });

  return NextResponse.json({ saves: result });
}

// DELETE: delete all saves for the current user
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    logEvent('get_save_history', { userId: null, error: 'not_logged_in' });
    return NextResponse.json(
      { error: 'Not logged in' },
      { status: 401 }
    );
  }

  const deleted = await prisma.saveState.deleteMany({
    where: { userId: user.id },
  });

  logEvent('get_save_history', {
    userId: user.id,
    deleted: deleted.count,
  });

  return NextResponse.json({ ok: true, deleted: deleted.count });
}
