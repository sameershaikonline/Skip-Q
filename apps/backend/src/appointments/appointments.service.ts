import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokensGateway } from '../tokens/tokens.gateway';
import { AppointmentStatus, PaymentStatus } from '@healthcare/shared';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private tokensGateway: TokensGateway,
  ) {}

  async createAppointment(patientId: string, dto: {
    hospitalId: string;
    departmentId?: string;
    doctorId?: string;
    appointmentDate: string;
    timeSlot: string;
    type?: 'ONLINE' | 'IN_PERSON';
    notes?: string;
  }) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: dto.hospitalId },
    });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    // Ensure department exists
    let departmentId = dto.departmentId;
    if (!departmentId) {
      let dept = await this.prisma.department.findFirst({ where: { hospitalId: dto.hospitalId } });
      if (!dept) {
        dept = await this.prisma.department.create({
          data: {
            name: 'General OPD Consultation',
            hospitalId: dto.hospitalId,
          },
        });
      }
      departmentId = dept.id;
    }

    // Ensure doctor exists
    let doctorId = dto.doctorId;
    let doctor = doctorId ? await this.prisma.doctor.findUnique({ where: { id: doctorId } }) : null;

    if (!doctor) {
      // Find or create default doctor for hospital
      doctor = await this.prisma.doctor.findFirst({ where: { hospitalId: dto.hospitalId } });
      if (!doctor) {
        // Create default doctor user
        const docUser = await this.prisma.user.create({
          data: {
            name: `Duty Doctor (${hospital.name})`,
            email: `doctor_${Date.now()}@hospital.com`,
            password: 'hashedpassword',
            role: 'DOCTOR',
            isVerified: true,
          },
        });

        doctor = await this.prisma.doctor.create({
          data: {
            userId: docUser.id,
            hospitalId: dto.hospitalId,
            departmentId: departmentId,
            specialization: 'General Medicine & OPD',
            qualification: 'MBBS, MD',
            fee: 500.0,
          },
        });
      }
      doctorId = doctor.id;
    }

    // Count existing tokens for the hospital today to generate sequence TK-101, TK-102...
    const countToday = await this.prisma.appointmentToken.count({
      where: { hospitalId: dto.hospitalId },
    });

    const tokenIndex = countToday + 1;
    const tokenNumber = `TK-${String(100 + tokenIndex)}`;

    // Create appointment & token in transaction
    const appointment = await this.prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          patientId,
          hospitalId: dto.hospitalId,
          departmentId: departmentId!,
          doctorId: doctorId!,
          appointmentDate: dto.appointmentDate,
          timeSlot: dto.timeSlot,
          type: dto.type || 'ONLINE',
          notes: dto.notes,
          totalFee: doctor!.fee,
          status: AppointmentStatus.BOOKED,
        },
      });

      await tx.appointmentToken.create({
        data: {
          appointmentId: appt.id,
          hospitalId: dto.hospitalId,
          tokenNumber,
          queuePosition: tokenIndex,
          estimatedWaitMinutes: (tokenIndex - 1) * 15,
          status: AppointmentStatus.IN_QUEUE,
        },
      });

      await tx.payment.create({
        data: {
          appointmentId: appt.id,
          userId: patientId,
          amount: doctor!.fee,
          provider: 'RAZORPAY',
          status: PaymentStatus.SUCCESS,
        },
      });

      return appt;
    });

    // Notify WebSockets
    await this.tokensGateway.notifyQueueUpdate(dto.hospitalId, tokenNumber, tokenIndex);

    return this.prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        token: true,
        doctor: { include: { user: { select: { name: true } } } },
        hospital: { select: { name: true, address: true } },
        payment: true,
      },
    });
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { token: true },
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    if (appt.token) {
      await this.prisma.appointmentToken.update({
        where: { id: appt.token.id },
        data: { status },
      });
    }

    return updated;
  }

  async getPatientAppointments(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        token: true,
        doctor: { include: { user: { select: { name: true, avatarUrl: true } } } },
        hospital: { select: { name: true, logo: true, address: true } },
        department: { select: { name: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDoctorAppointments(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        token: true,
        patient: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getHospitalAppointments(hospitalId: string) {
    return this.prisma.appointment.findMany({
      where: { hospitalId },
      include: {
        token: true,
        doctor: { include: { user: { select: { name: true } } } },
        patient: { select: { name: true, phone: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
