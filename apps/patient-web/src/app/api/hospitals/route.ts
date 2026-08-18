import { NextResponse } from 'next/server';
import { getHospitalStore, LiveHospital } from '@/lib/store';

export async function GET() {
  const store = getHospitalStore();
  const list = Array.from(store.values());
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || !data.address) {
      return NextResponse.json({ message: 'Hospital name and address required' }, { status: 400 });
    }

    const store = getHospitalStore();
    const id = data.id || `hosp_${Date.now()}`;

    const newHospital: LiveHospital = {
      id,
      name: data.name,
      address: data.address,
      city: data.city || 'Mahabubabad',
      contactNumber: data.contactNumber || '+91 99120 92468',
      email: data.email || 'hospital@skipq.in',
      openHours: data.openHours || '08:00 AM - 08:00 PM',
      rating: 4.8,
      reviewCount: 1,
      isEmergency: !!data.isEmergency,
      isGovernment: !!data.isGovernment,
      currentLiveToken: '1', // Starts at Token #1
      departments: data.departments || [{ id: 'd1', name: 'General Medicine' }],
      doctors: data.doctors || [
        {
          id: 'doc_1',
          name: data.doctorName || 'Dr. Duty Specialist MD',
          specialization: 'General Physician',
          qualification: 'MBBS, MD',
          experience: '10+ Years',
          roomNo: 'OPD Room 1',
          fee: 300,
          availableTime: '09:00 AM - 02:00 PM',
        },
      ],
    };

    store.set(id, newHospital);
    return NextResponse.json(newHospital, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create hospital' }, { status: 500 });
  }
}
