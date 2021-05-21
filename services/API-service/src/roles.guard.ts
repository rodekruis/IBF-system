import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from './api/user/user.service';
import { DEBUG } from './config';
import { User } from './api/user/user.model';

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
            const decoded: User = jwt.verify(token, process.env.SECRET);
            const user = await this.userService.findById(decoded.id);
            req.user = user.user;
            return true;
        }
        return false;
    }
}
