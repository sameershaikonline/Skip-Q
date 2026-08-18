import { NextResponse } from 'next/server';

const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a015cc0e0c4578';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(CLOUD_OBJECT_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.hospitals && Array.isArray(data.data.hospitals)) {
        const found = data.data.hospitals.find((h: any) => h.id === params.id);
        if (found) return NextResponse.json(found);
      }
    }
  } catch {}

  return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });
}
