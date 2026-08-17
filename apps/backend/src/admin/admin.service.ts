import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HospitalStatus, Role } from '@healthcare/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingHospitals() {
    return this.prisma.hospital.findMany({
      include: {
        admins: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });
  }

  async createHospitalManually(dto: any) {
    const existingHospital = await this.prisma.hospital.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existingHospital) {
      throw new BadRequestException('Hospital license number already registered.');
    }

    const adminEmail = dto.email || `admin_${Date.now()}@hospital.com`;
    const hashedPassword = await bcrypt.hash(dto.password || 'hospital123', 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Hospital Admin User
      const user = await tx.user.create({
        data: {
          name: `${dto.name} Admin`,
          email: adminEmail,
          phone: dto.contactNumber,
          password: hashedPassword,
          role: Role.HOSPITAL_ADMIN,
          isVerified: true,
        },
      });

      // 2. Create Approved Hospital
      const hospital = await tx.hospital.create({
        data: {
          name: dto.name,
          address: dto.address,
          city: dto.city || 'Mahabubabad',
          contactNumber: dto.contactNumber,
          email: adminEmail,
          licenseNumber: dto.licenseNumber || `MBD-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
          status: HospitalStatus.APPROVED,
          isGovernment: dto.isGovernment ?? false,
          isEmergency: dto.isEmergency ?? true,
          rating: 4.8,
          reviewCount: 12,
        },
      });

      // 3. Link Admin
      await tx.hospitalAdmin.create({
        data: {
          userId: user.id,
          hospitalId: hospital.id,
        },
      });

      // 4. Create default General OPD Department
      await tx.department.create({
        data: {
          name: 'General OPD Consultation',
          description: 'General outpatient department for token appointments',
          hospitalId: hospital.id,
        },
      });

      return {
        hospital,
        adminUser: { email: user.email, initialPassword: dto.password || 'hospital123' },
      };
    });
  }

  async updateHospitalStatus(hospitalId: string, status: HospitalStatus) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return this.prisma.hospital.update({
      where: { id: hospitalId },
      data: { status },
    });
  }

  async getPlatformMetrics() {
    const [totalHospitals, approvedHospitals, pendingHospitals, totalPatients, totalDoctors, totalAppointments] =
      await Promise.all([
        this.prisma.hospital.count(),
        this.prisma.hospital.count({ where: { status: HospitalStatus.APPROVED } }),
        this.prisma.hospital.count({ where: { status: HospitalStatus.PENDING } }),
        this.prisma.user.count({ where: { role: 'PATIENT' } }),
        this.prisma.doctor.count(),
        this.prisma.appointment.count(),
      ]);

    return {
      totalHospitals,
      approvedHospitals,
      pendingHospitals,
      totalPatients,
      totalDoctors,
      totalAppointments,
      revenueEstimated: totalAppointments * 500,
    };
  }
}
