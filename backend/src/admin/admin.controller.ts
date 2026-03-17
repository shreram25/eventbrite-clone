import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('events')
  getAllEvents() {
    return this.adminService.getAllEvents();
  }

  @Get('events/pending')
  getPendingEvents() {
    return this.adminService.getPendingEvents();
  }

  @Patch('events/:id/approve')
  approveEvent(@Param('id') id: string) {
    return this.adminService.approveEvent(id);
  }

  @Patch('events/:id/reject')
  rejectEvent(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectEvent(id, reason || 'Does not meet guidelines');
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }
}
