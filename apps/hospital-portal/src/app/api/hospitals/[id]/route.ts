import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: params.id },
      include: {
        departments: true,
        doctors: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json(hospital, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
