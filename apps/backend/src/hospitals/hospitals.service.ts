import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HospitalStatus, Role } from '@healthcare/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) {}

  // List hospitals for Zomato-style patient discovery
  async findAll(query: {
    search?: string;
    city?: string;
    department?: string;
    isEmergency?: boolean;
    isGovernment?: boolean;
    minRating?: number;
    lat?: number;
    lng?: number;
  }) {
    const where: any = {
      status: HospitalStatus.APPROVED,
    };

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isEmergency) {
      where.isEmergency = true;
    }

    if (query.isGovernment !== undefined) {
      where.isGovernment = String(query.isGovernment) === 'true';
    }

    if (query.minRating) {
      where.rating = { gte: Number(query.minRating) };
    }

    const hospitals = await this.prisma.hospital.findMany({
      where,
      include: {
        departments: true,
        doctors: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { doctors: true, departments: true, reviews: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    if (query.lat && query.lng) {
      return hospitals.map((h) => {
        const dist = this.calculateDistance(Number(query.lat), Number(query.lng), h.latitude, h.longitude);
        return { ...h, distanceKm: Math.round(dist * 10) / 10 };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return hospitals.map((h) => ({ ...h, distanceKm: 2.5 }));
  }

  async findOne(id: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            doctors: {
              include: {
                user: { select: { name: true, avatarUrl: true } },
                schedules: true,
              },
            },
          },
        },
        doctors: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
            schedules: true,
          },
        },
        reviews: {
          include: {
            patient: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return hospital;
  }

  async addDoctorToHospital(hospitalId: string, dto: {
    name: string;
    email: string;
    specialization: string;
    qualification: string;
    experience?: number;
    fee?: number;
    departmentName?: string;
  }) {
    if (!hospitalId) {
      throw new BadRequestException('Hospital ID is required');
    }

    // Ensure department exists or create
    let department = await this.prisma.department.findFirst({
      where: { hospitalId, name: dto.departmentName || 'General OPD' },
    });

    if (!department) {
      department = await this.prisma.department.create({
        data: {
          name: dto.departmentName || 'General OPD',
          hospitalId,
        },
      });
    }

    const hashedPassword = await bcrypt.hash('doctor123', 10);
    const email = dto.email || `doc_${Date.now()}@hospital.com`;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email,
          password: hashedPassword,
          role: Role.DOCTOR,
          isVerified: true,
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          hospitalId,
          departmentId: department!.id,
          specialization: dto.specialization || 'General OPD Specialist',
          qualification: dto.qualification || 'MBBS, MD',
          experience: dto.experience || 5,
          fee: dto.fee || 500.0,
        },
      });

      return doctor;
    });
  }

  async updateLiveToken(hospitalId: string, liveToken: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return this.prisma.hospital.update({
      where: { id: hospitalId },
      data: { currentLiveToken: String(liveToken) },
    });
  }

  async getHospitalDoctors(hospitalId: string) {
    return this.prisma.doctor.findMany({
      where: { hospitalId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        department: { select: { name: true } },
      },
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
