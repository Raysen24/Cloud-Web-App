import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, hashPassword, destroySession } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    // return null when not logged in
    return NextResponse.json(null, { status: 200 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  });
}

export async function PUT(request: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { displayName, password } = await request.json();

  const data: any = {};
  if (displayName) data.displayName = displayName;
  if (password) data.passwordHash = await hashPassword(password);

  const updated = await prisma.user.update({
    where: { id: current.id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    displayName: updated.displayName,
  });
}

export async function DELETE() {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: current.id } });
  await destroySession();

  return NextResponse.json({ ok: true });
}
