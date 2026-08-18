import { NextResponse } from 'next/server';
import { getHospitalStore } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const store = getHospitalStore();
  const hospital = store.get(params.id);

  if (!hospital) {
    return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });
  }

  return NextResponse.json(hospital);
}
