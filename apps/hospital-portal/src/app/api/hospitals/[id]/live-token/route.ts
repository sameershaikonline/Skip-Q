import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { liveToken } = await req.json();

    return NextResponse.json({
      message: `Live Token updated to Token #${liveToken} successfully!`,
      currentLiveToken: String(liveToken),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Failed to update live token' }, { status: 500 });
  }
}
