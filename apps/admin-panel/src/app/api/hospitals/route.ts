import { NextResponse } from 'next/server';
import { fetchAllHospitals } from '@/lib/cloudStore';

export async function GET() {
  const list = await fetchAllHospitals();
  return NextResponse.json(list, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
