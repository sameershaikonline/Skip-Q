import { NextResponse } from 'next/server';
import { getAdminHospitals } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const store = getAdminHospitals();
    const hosp = store.get(params.id);

    if (hosp) {
      hosp.status = status;
      store.set(params.id, hosp);
    }

    return NextResponse.json({ message: 'Status updated', hospital: hosp }, {
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
