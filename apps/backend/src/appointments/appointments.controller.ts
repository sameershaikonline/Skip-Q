import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createAppointment(@Request() req: any, @Body() dto: any) {
    return this.appointmentsService.createAppointment(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  async updateAppointmentStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentsService.updateAppointmentStatus(id, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-patient-appointments')
  async getMyPatientAppointments(@Request() req: any) {
    return this.appointmentsService.getPatientAppointments(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('doctor-appointments')
  async getDoctorAppointments(@Request() req: any) {
    return this.appointmentsService.getDoctorAppointments(req.user.doctorProfile?.id || req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('hospital-appointments')
  async getHospitalAppointments(@Request() req: any) {
    return this.appointmentsService.getHospitalAppointments(req.user.hospitalAdmin?.hospitalId);
  }
}
