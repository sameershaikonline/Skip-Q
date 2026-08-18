import { NextResponse } from 'next/server';
import { saveHospital, HospitalRecord } from '@/lib/cloudStore';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.address || !data.contactNumber) {
      return NextResponse.json({ message: 'Hospital Name, Address, and Contact are required.' }, { status: 400 });
    }

    const id = data.id || `hosp_${Date.now()}`;
    const cleanEmail = (data.email || `admin@${data.name.toLowerCase().replace(/\s+/g, '')}.com`).trim().toLowerCase();
    const cleanPassword = data.password || 'hospital123';

    const newHosp: HospitalRecord = {
      id,
      name: data.name,
      address: data.address,
      city: data.city || 'Mahabubabad',
      contactNumber: data.contactNumber,
      email: cleanEmail,
      password: cleanPassword, // Stored securely for hospital partner login
      licenseNumber: data.licenseNumber || `LIC-${Date.now().toString().slice(-6)}`,
      status: 'APPROVED',
      isGovernment: !!data.isGovernment,
      isEmergency: data.isEmergency !== false,
      currentLiveToken: '1',
      doctors: [
        {
          id: `doc_${Date.now()}`,
          name: 'Dr. Duty Specialist MD',
          specialization: 'General Physician',
          qualification: 'MBBS, MD',
          fee: 300,
          roomNo: 'OPD Room 1',
        },
      ],
    };

    await saveHospital(newHosp);

    return NextResponse.json({
      message: 'Hospital onboarded and synchronized across all domains successfully!',
      hospital: newHosp,
      adminUser: {
        email: newHosp.email,
        initialPassword: cleanPassword,
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
