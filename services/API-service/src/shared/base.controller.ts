import * as jwt from 'jsonwebtoken';
import { User } from '../api/user/user.model';

export class BaseController {
    public constructor() {}

    protected getUserIdFromToken(authorization): string {
        if (!authorization) return null;

        const token = authorization.split(' ')[1];
        const decoded: User = jwt.verify(token, process.env.SECRET);
        return decoded.id;
    }
}
