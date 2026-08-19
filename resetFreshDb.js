const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function resetFresh() {
  console.log('🧹 Cleaning all pre-existing data from Supabase PostgreSQL database...');

  // Delete all child and parent records in correct relational order
  await prisma.appointmentToken.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.videoSession.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorSchedule.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.hospitalAdmin.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✨ All old hospitals, users, appointments, and tokens successfully wiped!');

  // Seed only the Super Admin account
  const adminPassword = hashPassword('admin123');
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@skipq.in',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
      phone: '+91 99120 92468',
    },
  });

  console.log('👑 Fresh Super Admin initialized:');
  console.log('   Email:    admin@skipq.in');
  console.log('   Password: admin123');
  console.log('\n🚀 Clean slate ready! All 3 platforms are freshly united and connected to Supabase.');
}

resetFresh()
  .catch((e) => {
    console.error('Error during reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
