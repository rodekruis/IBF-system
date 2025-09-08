import { Controller, Get, Request, UseGuards } from '@nestjs/common';
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

import { User } from './api/user/user.model';
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
  @ApiOperation({ summary: 'Check your authentication status' })
  @ApiResponse({
    status: 200,
    description: 'You are logged in as user@example.nl with role viewer',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  public checkAuthentication(@Request() req: { user: { user: User } }) {
    return {
      message: `You are logged in as ${req.user.user.email} with role ${req.user.user.userRole}`,
    };
  }

  @ApiOperation({ summary: 'Check database connection' })
  @Get('health')
  public healthCheck(): Promise<HealthIndicatorResult> {
    return this.db.pingCheck('database', { timeout: 300 });
  }
}
