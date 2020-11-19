/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from './user/user.service';
import { SECRET } from './secrets';
import { DEBUG } from './config';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly userService: UserService;

  public constructor(userService: UserService) {
    this.userService = userService;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    if (DEBUG) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeaders = req.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];
      const decoded: any = jwt.verify(token, SECRET);
      const user = await this.userService.findById(decoded.id);
      req.user = user.user;
      return true;
    }
    return false;
  }
}
