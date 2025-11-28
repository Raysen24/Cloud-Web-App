import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';
import { logEvent } from '@/lib/metrics';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, displayName } = body;

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    await createSession(user.id);

    logEvent('user_register', { userId: user.id, email });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (err) {
    logEvent('user_register', {
      userId: null,
      email,
      error: 'register_failed',
    });
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );
  }
}
