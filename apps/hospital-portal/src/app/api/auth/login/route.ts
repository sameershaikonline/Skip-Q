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
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();
    const passwordHash = hashPassword(cleanPassword);

    // 1. Look up User in Supabase with role HOSPITAL_ADMIN or HOSPITAL_STAFF
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        hospitalAdmin: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        message: `Hospital email "${cleanEmail}" is not authorized. Please ask Super Admin to onboard your hospital first.`,
      }, { status: 401 });
    }

    // Verify Password against hash or plain password
    const isPasswordValid = user.password === passwordHash || user.password === cleanPassword;
    if (!isPasswordValid) {
      return NextResponse.json({
        message: 'Invalid password. Please enter the password assigned to your hospital by Super Admin.',
      }, { status: 401 });
    }

    // Check Hospital Status
    const hospital = user.hospitalAdmin?.hospital;
    if (hospital && hospital.status === 'SUSPENDED') {
      return NextResponse.json({
        message: 'This hospital has been suspended by Super Admin governance.',
      }, { status: 403 });
    }

    const token = `hosp_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: hospital?.name || user.name,
        email: user.email,
        city: hospital?.city || 'Mahabubabad',
        role: user.role,
        hospitalId: hospital?.id || user.hospitalAdmin?.hospitalId,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    console.error('Hospital Portal Login Error:', err);
    return NextResponse.json({ message: err.message || 'Authentication failed' }, { status: 500 });
  }
}
