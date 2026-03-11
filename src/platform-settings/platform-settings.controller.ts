/**
 * platform-settings/platform-settings.controller.ts
 * ====================================================
 * Public endpoint for frontend to fetch plan pricing and feature flags.
 * NO authentication required — this data is needed on public pages
 * (e.g. pricing page, subscription page before login).
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlatformSettingsService } from './platform-settings.service';

@ApiTags('platform')
@Controller('platform')
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Get public platform settings',
    description:
      'Returns plan pricing, active plans, and feature flags. ' +
      'No authentication required.',
  })
  @ApiResponse({ status: 200, description: 'Public platform settings' })
  async getPublicSettings() {
    return this.platformSettingsService.getPublicSettings();
  }
}
