import { NextResponse } from 'next/server';
import { getAdminHospitals, AdminHospital } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.address || !data.contactNumber) {
      return NextResponse.json({ message: 'Hospital Name, Address, and Contact are required.' }, { status: 400 });
    }

    const store = getAdminHospitals();
    const id = data.id || `hosp_${Date.now()}`;

    const newHosp: AdminHospital = {
      id,
      name: data.name,
      address: data.address,
      city: data.city || 'Mahabubabad',
      contactNumber: data.contactNumber,
      email: data.email || `admin@${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
      licenseNumber: data.licenseNumber || `LIC-${Date.now().toString().slice(-6)}`,
      status: 'APPROVED',
      isGovernment: !!data.isGovernment,
      isEmergency: data.isEmergency !== false,
      currentLiveToken: '1',
    };

    store.set(id, newHosp);

    return NextResponse.json({
      message: 'Hospital onboarded successfully!',
      hospital: newHosp,
      adminUser: {
        email: newHosp.email,
        initialPassword: data.password || 'hospital123',
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Onboarding failed' }, { status: 500 });
  }
}
