import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.address || !data.contactNumber || !data.email) {
      return NextResponse.json({ message: 'Hospital Name, Address, Contact, and Email are required.' }, { status: 400 });
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password || 'hospital123';
    const passwordHash = hashPassword(cleanPassword);
    const licenseNumber = data.licenseNumber || `TS-${Date.now().toString().slice(-6)}`;

    // 1. Create or update Hospital record in Supabase
    const hospital = await prisma.hospital.upsert({
      where: { licenseNumber },
      update: {
        name: data.name,
        address: data.address,
        city: data.city || 'Mahabubabad',
        contactNumber: data.contactNumber,
        email: cleanEmail,
        password: cleanPassword,
        status: 'APPROVED',
        isGovernment: !!data.isGovernment,
        isEmergency: data.isEmergency !== false,
      },
      create: {
        name: data.name,
        address: data.address,
        city: data.city || 'Mahabubabad',
        contactNumber: data.contactNumber,
        email: cleanEmail,
        password: cleanPassword,
        licenseNumber,
        status: 'APPROVED',
        isGovernment: !!data.isGovernment,
        isEmergency: data.isEmergency !== false,
        currentLiveToken: '1',
      },
    });

    // 2. Create or update Hospital Admin User in Supabase
    const adminUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: `${data.name} Admin`,
        password: passwordHash,
        role: 'HOSPITAL_ADMIN',
        isVerified: true,
      },
      create: {
        name: `${data.name} Admin`,
        email: cleanEmail,
        password: passwordHash,
        role: 'HOSPITAL_ADMIN',
        isVerified: true,
        phone: data.contactNumber,
      },
    });

    // 3. Link HospitalAdmin table
    await prisma.hospitalAdmin.upsert({
      where: { userId: adminUser.id },
      update: { hospitalId: hospital.id },
      create: {
        userId: adminUser.id,
        hospitalId: hospital.id,
      },
    });

    // 4. Create default General Medicine Department
    const dept = await prisma.department.create({
      data: {
        name: 'General Medicine',
        description: 'Comprehensive OPD and emergency consultation',
        hospitalId: hospital.id,
      },
    });

    // 5. Create default Duty Doctor
    const docUser = await prisma.user.create({
      data: {
        name: 'Dr. Duty Specialist MD',
        email: `doc.${Date.now()}@skipq.in`,
        password: passwordHash,
        role: 'DOCTOR',
        isVerified: true,
      },
    });

    await prisma.doctor.create({
      data: {
        userId: docUser.id,
        hospitalId: hospital.id,
        departmentId: dept.id,
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        experience: 5,
        fee: 300,
        roomNo: 'OPD Room 1',
        availableTime: '09:00 AM - 02:00 PM',
      },
    });

    return NextResponse.json({
      message: `Hospital "${hospital.name}" onboarded and saved to Supabase successfully!`,
      hospital,
      adminUser: {
        email: cleanEmail,
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
    console.error('Super Admin Onboard Error:', err);
    return NextResponse.json({ message: err.message || 'Failed to onboard hospital' }, { status: 500 });
  }
}
