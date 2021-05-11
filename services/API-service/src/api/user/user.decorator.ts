import { createParamDecorator } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from './user.model';

export const UserDecorator = createParamDecorator(
    (data, req): User => {
        // if route is protected, there is a user set in auth.middleware
        if (!!req.user) {
            return !!data ? req.user[data] : req.user;
        }

        // in case a route is not protected, we still want to get the optional auth user from jwt
        const token = req.headers.authorization
            ? (req.headers.authorization as string).split(' ')
            : null;

        if (token && token[1]) {
            const decoded: User = jwt.verify(token[1], process.env.SECRET);

            return !!data ? decoded[data] : decoded;
        }
    },
);
