import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { liveToken } = await req.json();

    if (!liveToken) {
      return NextResponse.json({ message: 'liveToken value required' }, { status: 400 });
    }

    const hospital = await prisma.hospital.update({
      where: { id: params.id },
      data: { currentLiveToken: String(liveToken) },
    });

    return NextResponse.json({
      message: `Live Token updated to Token #${liveToken} in Supabase!`,
      currentLiveToken: String(liveToken),
      hospital,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    console.error('Update live token error:', err);
    return NextResponse.json({ message: 'Failed to update live token' }, { status: 500 });
  }
}
