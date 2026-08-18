import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.contactNumber || !data.email) {
      return NextResponse.json({ message: 'Hospital Name, Contact, and Email are required.' }, { status: 400 });
    }

    const hospitalId = `hosp_${Date.now()}`;
    const newHospital = {
      id: hospitalId,
      name: data.name,
      address: data.address || 'Mahabubabad',
      city: data.city || 'Mahabubabad',
      contactNumber: data.contactNumber,
      email: data.email,
      licenseNumber: data.licenseNumber || `LIC-${Date.now().toString().slice(-6)}`,
      isEmergency: data.isEmergency !== false,
      isGovernment: !!data.isGovernment,
      currentLiveToken: '1',
      status: 'APPROVED',
    };

    return NextResponse.json({
      message: 'Hospital registered and approved successfully!',
      hospital: newHospital,
      user: {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: 'HOSPITAL_ADMIN',
        hospitalId,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Registration failed' }, { status: 500 });
  }
}
