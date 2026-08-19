import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';

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

    // 4. Create default General Medicine Department if none exists
    const existingDept = await prisma.department.findFirst({
      where: { hospitalId: hospital.id },
    });

    let deptId = existingDept?.id;
    if (!existingDept) {
      const dept = await prisma.department.create({
        data: {
          name: 'General Medicine',
          description: 'Comprehensive OPD and emergency consultation',
          hospitalId: hospital.id,
        },
      });
      deptId = dept.id;
    }

    // 5. Create default Duty Doctor if none exists
    const existingDoctor = await prisma.doctor.findFirst({
      where: { hospitalId: hospital.id },
    });

    if (!existingDoctor && deptId) {
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
          departmentId: deptId,
          specialization: 'General Physician',
          qualification: 'MBBS, MD',
          experience: 5,
          fee: 300,
          roomNo: 'OPD Room 1',
          availableTime: '09:00 AM - 02:00 PM',
        },
      });
    }

    // 6. Send official Email Dispatch to the Hospital if SMTP credentials exist
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: smtpUser, pass: smtpPass },
        });

        const htmlEmail = `
          <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 20px;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
              <h2 style="color: #6366f1; margin: 0; font-size: 24px;">🏢 SkipQ Hospital Management Portal</h2>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Hospital Partner Access Authorization</p>
            </div>
            <div style="padding: 24px 0;">
              <p style="font-size: 14px; color: #cbd5e1;">Welcome, <strong>${data.name}</strong> Team!</p>
              <p style="font-size: 13px; color: #94a3b8;">Your hospital has been verified and onboarded by Super Admin to the <strong>SkipQ OPD Queue System</strong> in ${data.city || 'Mahabubabad'}.</p>
              
              <div style="background-color: #1e293b; padding: 20px; border-radius: 14px; margin: 20px 0; border: 1px solid #3b82f6;">
                <p style="margin: 0 0 10px 0; color: #93c5fd; font-weight: bold; font-size: 13px;">YOUR HOSPITAL PORTAL CREDENTIALS:</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>Login URL:</strong> <a href="https://skipq-hospital.vercel.app/auth/login" style="color: #38bdf8;">https://skipq-hospital.vercel.app/auth/login</a></p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>Authorized Email:</strong> <code style="color: #4ade80;">${cleanEmail}</code></p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>Assigned Password:</strong> <code style="color: #facc15;">${cleanPassword}</code></p>
              </div>

              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                You can now log in to the Hospital Portal to view upcoming patient appointments, onboard your doctors, and call live queue tokens as patients enter the consultation room.
              </p>
            </div>
            <div style="border-top: 1px solid #334155; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b;">
              SkipQ Healthcare Platform • Super Admin Governance Hub
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"SkipQ Admin" <${smtpUser}>`,
          to: cleanEmail,
          subject: `🎉 ${data.name} is Approved on SkipQ! Login Credentials Inside`,
          html: htmlEmail,
        });
      } catch (mailErr) {
        console.warn('Mail dispatch error:', mailErr);
      }
    }

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
