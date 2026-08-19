import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();

    const hospital = await prisma.hospital.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ message: 'Status updated', hospital }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Failed to update status' }, { status: 500 });
  }
}
