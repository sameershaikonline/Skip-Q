import { NextResponse } from 'next/server';

const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a015cc0e0c4578';

export async function GET() {
  try {
    const res = await fetch(CLOUD_OBJECT_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.hospitals && Array.isArray(data.data.hospitals)) {
        return NextResponse.json(data.data.hospitals);
      }
    }
  } catch {}

  return NextResponse.json([]);
}
