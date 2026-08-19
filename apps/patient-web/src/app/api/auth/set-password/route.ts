import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { email, name, phone, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || 'Patient';
    const cleanPhone = (phone || '').trim();
    const passwordHash = hashPassword(password);

    // Upsert User in Supabase PostgreSQL
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: cleanName,
        phone: cleanPhone || undefined,
        password: passwordHash,
        role: 'PATIENT',
        isVerified: true,
      },
      create: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        password: passwordHash,
        role: 'PATIENT',
        isVerified: true,
      },
    });

    // Remove consumed OTP from store
    const store = (global as any).__OTP_STORE__;
    if (store) store.delete(cleanEmail);

    const token = `jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      message: 'Account created and password set successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Set Password Error:', err);
    return NextResponse.json({ message: err.message || 'Failed to set password.' }, { status: 500 });
  }
}
