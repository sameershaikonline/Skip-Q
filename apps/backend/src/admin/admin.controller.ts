import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { HospitalStatus } from '@healthcare/shared';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending-hospitals')
  async getPendingHospitals() {
    return this.adminService.getPendingHospitals();
  }

  @Post('onboard-hospital')
  async createHospitalManually(@Body() dto: any) {
    return this.adminService.createHospitalManually(dto);
  }

  @Patch('hospitals/:id/status')
  async updateHospitalStatus(@Param('id') id: string, @Body('status') status: HospitalStatus) {
    return this.adminService.updateHospitalStatus(id, status);
  }

  @Get('metrics')
  async getMetrics() {
    return this.adminService.getPlatformMetrics();
  }
}
