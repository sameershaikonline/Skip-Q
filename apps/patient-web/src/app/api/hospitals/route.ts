import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        departments: true,
        doctors: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });

    return NextResponse.json(hospitals, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    console.error('Error fetching approved hospitals from Supabase:', err);
    return NextResponse.json([], { status: 500 });
  }
}
