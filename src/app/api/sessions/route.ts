import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logEvent } from '@/lib/metrics';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    logEvent('session_finished', { userId: null, error: 'not_logged_in' });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json();
  const { difficulty, timeTaken } = body as {
    difficulty?: string;
    timeTaken?: number;
  };

  if (!difficulty || typeof timeTaken !== 'number') {
    logEvent('session_finished', {
      userId: user.id,
      error: 'invalid_payload',
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session = await prisma.gameSession.create({
    data: {
      userId: user.id,
      difficulty,
      timeTaken,
    },
  });

  logEvent('session_finished', {
    userId: user.id,
    difficulty,
    timeTaken,
    gameSessionId: session.id,
  });

  return NextResponse.json({ ok: true });
}
