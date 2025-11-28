import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { logEvent } from '@/lib/metrics';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logEvent('user_login', { email, success: false, reason: 'no_user' });
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    logEvent('user_login', { email, success: false, reason: 'bad_password' });
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  await createSession(user.id);

  logEvent('user_login', { userId: user.id, email, success: true });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  });
}
