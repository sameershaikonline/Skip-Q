import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        department: true,
        hospital: { select: { name: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(doctors, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, specialization, qualification, fee, departmentName, hospitalId } = body;

    // Get active hospital
    const targetHospital = hospitalId
      ? await prisma.hospital.findUnique({ where: { id: hospitalId } })
      : await prisma.hospital.findFirst({ where: { status: 'APPROVED' } });

    if (!targetHospital) {
      return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });
    }

    // 1. Get or create Department
    let dept = await prisma.department.findFirst({
      where: { hospitalId: targetHospital.id, name: departmentName || 'General OPD' },
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: departmentName || 'General OPD',
          hospitalId: targetHospital.id,
        },
      });
    }

    // 2. Create User account for Doctor
    const docEmail = email?.trim().toLowerCase() || `doc.${Date.now()}@skipq.in`;
    const docUser = await prisma.user.upsert({
      where: { email: docEmail },
      update: { name: name || 'Specialist Doctor', role: 'DOCTOR' },
      create: {
        name: name || 'Specialist Doctor',
        email: docEmail,
        password: 'doctor@password',
        role: 'DOCTOR',
        isVerified: true,
      },
    });

    // 3. Create Doctor Profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: docUser.id,
        hospitalId: targetHospital.id,
        departmentId: dept.id,
        specialization: specialization || 'General Physician',
        qualification: qualification || 'MBBS',
        fee: Number(fee) || 300,
        experience: 5,
        roomNo: 'OPD Room 1',
        availableTime: '09:00 AM - 02:00 PM',
      },
      include: {
        user: true,
        department: true,
      },
    });

    return NextResponse.json({ message: 'Doctor added successfully', doctor }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to save doctor' }, { status: 500 });
  }
}
