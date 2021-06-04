import { Get, Controller } from '@nestjs/common';
import {
  ApiHeader,
  ApiHeaderOptions,
  ApiOperation,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiOperation({ summary: 'Check API access' })
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Response body is the text "Hello World!"',
  })
  public root(): string {
    return 'Hello World!';
  }
}
