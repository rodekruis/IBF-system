import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { RolesGuard } from './roles.guard';

@ApiTags('--app--')
@Controller()
export class AppController {
  constructor(private readonly db: TypeOrmHealthIndicator) {}

  @Get()
  @ApiOperation({ summary: 'Check if API is working' })
  @ApiResponse({
    status: 200,
    description: 'Response body is the text "API working"',
  })
  public check(): string {
    return 'API working';
  }

  @Get('authentication')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Check if API authentication is working' })
  @ApiResponse({ status: 200, description: 'API authentication working' })
  @ApiResponse({ status: 403, description: 'API authentication NOT working' })
  public checkAuthentication(): string {
    return 'API authentication working';
  }

  @ApiOperation({ summary: 'Check database connection' })
  @Get('health')
  public healthCheck(): Promise<HealthIndicatorResult> {
    return this.db.pingCheck('database', { timeout: 300 });
  }
}
