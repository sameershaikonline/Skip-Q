import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = hashPassword(password);

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ message: 'No account found with this email address. Please register.' }, { status: 404 });
    }

    if (user.password !== passwordHash) {
      return NextResponse.json({ message: 'Invalid password. Please try again or use Forgot Password.' }, { status: 401 });
    }

    const token = `jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      message: 'Login successful!',
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
    console.error('Patient Login API Error:', err);
    return NextResponse.json({ message: err.message || 'Login failed.' }, { status: 500 });
  }
}
