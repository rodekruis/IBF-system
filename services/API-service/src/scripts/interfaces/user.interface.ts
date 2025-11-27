import { User as UserModel } from '../../api/user/user.model';

export interface User
  extends Pick<
    UserModel,
    | 'email'
    | 'firstName'
    | 'middleName'
    | 'lastName'
    | 'userRole'
    | 'countryCodesISO3'
    | 'disasterTypes'
  > {
  password: string;
}
