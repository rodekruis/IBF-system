import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { LoginDto } from './login.dto';
import { LoginService } from './login.service';

@ApiTags('--app--')
@Controller('login')
export class LoginController {
  private readonly loginService: LoginService;

  public constructor(loginService: LoginService) {
    this.loginService = loginService;
  }

  @ApiOperation({ summary: 'Send login code to email' })
  @Post()
  public async login(@Body() { email, code }: LoginDto, @Res() res: Response) {
    if (code) {
      try {
        const { user } = await this.loginService.verify(email, code);
        return res.status(HttpStatus.OK).send({ user });
      } catch ({ message }) {
        return res.status(HttpStatus.UNAUTHORIZED).send({ message });
      }
    }

    try {
      const { message } = await this.loginService.send(email);
      return res.status(HttpStatus.CREATED).send({ message });
    } catch ({ message }) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message });
    }
  }
}
