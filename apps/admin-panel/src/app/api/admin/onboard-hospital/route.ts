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

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^[0-9]{10}$/;

    const cleanEmail = data.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ message: 'Please provide a valid hospital email with domain suffix (e.g. reception@hospital.com).' }, { status: 400 });
    }

    const cleanPhone = data.contactNumber.replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json({ message: 'Reception contact phone must be exactly 10 digits.' }, { status: 400 });
    }
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
          name: 'General OPD',
          description: 'Comprehensive outpatient care',
          hospitalId: hospital.id,
        },
      });
      deptId = dept.id;
    }

    // 5. Create Doctors from data.doctors list (if provided), or default duty doctor
    if (Array.isArray(data.doctors) && data.doctors.length > 0) {
      for (const doc of data.doctors) {
        if (!doc.name?.trim()) continue;

        const docEmail = doc.email?.trim().toLowerCase() || `doc.${Date.now()}.${Math.floor(Math.random() * 1000)}@skipq.in`;
        const docUser = await prisma.user.upsert({
          where: { email: docEmail },
          update: {
            name: doc.name.trim(),
            avatarUrl: doc.imageUrl?.trim() || null,
          },
          create: {
            name: doc.name.trim(),
            email: docEmail,
            password: passwordHash,
            role: 'DOCTOR',
            avatarUrl: doc.imageUrl?.trim() || null,
            isVerified: true,
          },
        });

        await prisma.doctor.create({
          data: {
            userId: docUser.id,
            hospitalId: hospital.id,
            departmentId: deptId!,
            specialization: doc.designation?.trim() || 'General Physician',
            qualification: doc.qualification?.trim() || 'MBBS',
            bio: doc.description?.trim() || null,
            experience: Number(doc.experience) || 5,
            fee: Number(doc.fee) || 300,
            roomNo: doc.roomNo?.trim() || 'OPD Room 1',
            availableTime: '09:00 AM - 02:00 PM',
          },
        });
      }
    } else {
      // Default Doctor
      const docUser = await prisma.user.create({
        data: {
          name: 'Duty Specialist Doctor',
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
          departmentId: deptId!,
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
              <h2 style="color: #6366f1; margin: 0; font-size: 24px;">🏢 Skip-Q Hospital Management Portal</h2>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Hospital Partner Access Authorization</p>
            </div>
            <div style="padding: 24px 0;">
              <p style="font-size: 14px; color: #cbd5e1;">Welcome, <strong>${data.name}</strong> Team!</p>
              <p style="font-size: 13px; color: #94a3b8;">Your hospital has been verified and onboarded by Super Admin to the <strong>Skip-Q OPD Queue System</strong> in ${data.city || 'Mahabubabad'}.</p>
              
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
              Skip-Q Healthcare Platform • Super Admin Governance Hub
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Skip-Q Admin" <${smtpUser}>`,
          to: cleanEmail,
          subject: `🎉 ${data.name} is Approved on Skip-Q! Login Credentials Inside`,
          html: htmlEmail,
        });
      } catch (mailErr) {
        console.warn('Hospital notification email delivery skipped:', mailErr);
      }
    }

    return NextResponse.json({
      message: 'Hospital and doctors onboarded successfully into database',
      hospital,
    });
  } catch (error: any) {
    console.error('Onboarding hospital failed:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to onboard hospital' },
      { status: 500 }
    );
  }
}
