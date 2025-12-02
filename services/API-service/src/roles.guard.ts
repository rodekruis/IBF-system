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

      // admin can access any route
      if (user.userRole === UserRole.Admin) {
        return true;
      }

      // check route-roles
      const endpointRoles = this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );
      if (!endpointRoles) {
        // route is open to any user-role
        // if no route-roles are specified
        return true;
      }

      // allow if user-role is in route-roles
      return endpointRoles.includes(user.userRole);
    }
    return false;
  }
}
