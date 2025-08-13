import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { LoginDto, LoginVerifyDto } from './login.dto';
import { LoginService } from './login.service';

@ApiTags('--login--')
@Controller('login')
export class LoginController {
  private readonly loginService: LoginService;

  public constructor(loginService: LoginService) {
    this.loginService = loginService;
  }

  @ApiOperation({ summary: 'Send login code to user' })
  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 201, description: 'Code sent to your email' })
  @ApiResponse({ status: 403, description: 'Failed to login.' })
  @Post()
  public async login(@Body() { email }: LoginDto) {
    const success = await this.loginService.send(email);

    if (!success) {
      return {
        message: `Failed to login. Email ${process.env.SUPPORT_EMAIL_ADDRESS} for more information.`,
      };
    }

    return { message: 'Code sent to your email' };
  }

  @ApiOperation({ summary: 'Verify login code' })
  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 202, description: 'Code is valid' })
  @ApiResponse({ status: 403, description: 'Code is not valid' })
  @Post('verify')
  public async verify(@Body() { email, code }: LoginVerifyDto) {
    return await this.loginService.verify(email, code);
  }
}
