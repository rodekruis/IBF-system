import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';

import { User } from './user.model';

export const UserDecorator = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();

    const token = req.headers.authorization
      ? (req.headers.authorization as string).split(' ')
      : null;

    if (token && token[1]) {
      const decoded: User = jwt.verify(token[1], process.env.SECRET);

      return !!data ? decoded[data] : decoded;
    }
  },
);
