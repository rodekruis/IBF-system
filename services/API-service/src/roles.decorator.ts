import { SetMetadata } from '@nestjs/common';
import { UserRole } from './api/user/user-role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
