import { Controller, Get, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthIndicatorResult,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('-- check API --')
@Controller('health')
export class HealthController {
  constructor(private readonly db: TypeOrmHealthIndicator) {}

  @ApiOperation({ summary: 'Check database connection' })
  @Get()
  async healthCheck(): Promise<HealthIndicatorResult> {
    return this.db.pingCheck('database', { timeout: 300 });
  }
}

@Module({ controllers: [HealthController], imports: [TerminusModule] })
export class HealthModule {}
