import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('department') department?: string,
    @Query('isEmergency') isEmergency?: boolean,
    @Query('isGovernment') isGovernment?: boolean,
    @Query('minRating') minRating?: number,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.hospitalsService.findAll({
      search,
      city,
      department,
      isEmergency,
      isGovernment,
      minRating,
      lat,
      lng,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('doctors')
  async addDoctor(@Request() req: any, @Body() dto: any) {
    const hospitalId = req.user.hospitalAdmin?.hospitalId;
    return this.hospitalsService.addDoctorToHospital(hospitalId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-doctors')
  async getMyDoctors(@Request() req: any) {
    const hospitalId = req.user.hospitalAdmin?.hospitalId;
    return this.hospitalsService.getHospitalDoctors(hospitalId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/live-token')
  async updateLiveToken(@Param('id') id: string, @Body('liveToken') liveToken: string) {
    return this.hospitalsService.updateLiveToken(id, liveToken);
  }
}
