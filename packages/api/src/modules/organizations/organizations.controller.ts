import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';
import { Organization } from '@event-platform/database';

@ApiTags('organizations')
@Controller({ path: 'organization', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get current organization' })
  async getCurrent(): Promise<Organization> {
    return this.organizationsService.getCurrent();
  }

  @Put()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Update organization' })
  async update(@Body() dto: any): Promise<Organization> {
    return this.organizationsService.update(dto);
  }

  @Get('members')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get organization members' })
  async getMembers(): Promise<object[]> {
    return this.organizationsService.getMembers();
  }
}
