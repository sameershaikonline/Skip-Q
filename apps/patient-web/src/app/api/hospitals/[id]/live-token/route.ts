import { NextResponse } from 'next/server';

const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a015cc0e0c4578';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { liveToken } = await req.json();

    if (!liveToken) {
      return NextResponse.json({ message: 'liveToken required' }, { status: 400 });
    }

    try {
      const res = await fetch(CLOUD_OBJECT_URL, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.hospitals && Array.isArray(data.data.hospitals)) {
          const updated = data.data.hospitals.map((h: any) =>
            h.id === params.id ? { ...h, currentLiveToken: String(liveToken) } : h
          );

          await fetch(CLOUD_OBJECT_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'skipq_hospitals_cloud',
              data: { hospitals: updated },
            }),
          });
        }
      }
    } catch (err) {
      console.warn('Live token sync error:', err);
    }

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
