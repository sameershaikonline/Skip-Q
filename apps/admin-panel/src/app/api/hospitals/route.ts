import { NextResponse } from 'next/server';
import { getAdminHospitals } from '@/lib/store';

export async function GET() {
  const store = getAdminHospitals();
  const list = Array.from(store.values());
  return NextResponse.json(list, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
