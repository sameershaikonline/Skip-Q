import { NextResponse } from 'next/server';
import { fetchAllHospitals } from '@/lib/cloudStore';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Fetch all hospitals onboarded by Super Admin from Cloud Store
    const hospitals = await fetchAllHospitals();
    const matchedHospital = hospitals.find(
      (h) => h.email?.toLowerCase().trim() === cleanEmail
    );

    if (!matchedHospital) {
      return NextResponse.json({
        message: `Hospital email "${cleanEmail}" is not authorized. Please ask Super Admin to onboard your hospital first.`,
      }, { status: 401 });
    }

    // Verify Password assigned by Super Admin
    const expectedPassword = (matchedHospital.password || 'hospital123').trim();
    if (expectedPassword !== cleanPassword) {
      return NextResponse.json({
        message: 'Invalid password. Please enter the password assigned to your hospital by Super Admin.',
      }, { status: 401 });
    }

    if (matchedHospital.status === 'SUSPENDED') {
      return NextResponse.json({
        message: 'This hospital has been suspended by Super Admin governance.',
      }, { status: 403 });
    }

    const token = `hosp_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      message: 'Authentication successful',
      token,
      user: {
        id: matchedHospital.id,
        name: matchedHospital.name,
        email: matchedHospital.email,
        city: matchedHospital.city,
        role: 'HOSPITAL_ADMIN',
        hospitalId: matchedHospital.id,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Authentication failed' }, { status: 500 });
  }
}
