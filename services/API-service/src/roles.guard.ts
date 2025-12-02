import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import * as jwt from 'jsonwebtoken';

import { User } from './api/user/user.model';
import { UserService } from './api/user/user.service';
import { UserRole } from './api/user/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly userService: UserService;

  public constructor(
    private readonly reflector: Reflector,
    userService: UserService,
  ) {
    this.userService = userService;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeaders = req.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];

      let decoded: User;
      try {
        decoded = jwt.verify(token, process.env.SECRET);
      } catch {
        return false;
      }

      const user = await this.userService.findById(decoded.userId);

      // check if logged in
      if (!user) {
        return false;
      }

      // if no roles specified for endpoint, then assume endpoint to be 'open' to any role (but log in required)
      const endpointRoles = this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );
      if (!endpointRoles) {
        return true;
      }

      // add admin-role to every endpoint
      if (!endpointRoles.includes(UserRole.Admin)) {
        endpointRoles.push(UserRole.Admin);
      }

      // check if user-role aligns with endpoint-roles
      return endpointRoles.includes(user.userRole as UserRole);
    }
    return false;
  }
}
