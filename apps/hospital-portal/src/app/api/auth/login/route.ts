import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const token = `hosp_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      message: 'Sign in successful!',
      token,
      user: {
        id: `user_${Date.now()}`,
        name: 'Hospital Management',
        email,
        role: 'HOSPITAL_ADMIN',
        hospitalId: `hosp_${Date.now()}`,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}
