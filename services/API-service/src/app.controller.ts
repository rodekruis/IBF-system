import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RolesGuard } from './roles.guard';

@ApiTags('-- check API --')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Check if API is working' })
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Response body is the text "API working"',
  })
  public check(): string {
    return 'API working';
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Check if API authentication is working' })
  @Get('authentication')
  @ApiResponse({
    status: 200,
    description: 'API authentication working',
  })
  @ApiResponse({
    status: 403,
    description: 'API authentication NOT working',
  })
  public checkAuthentication(): string {
    return 'API authentication working';
  }
}
