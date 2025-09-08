import { UserRole } from '../helpers/API-service/enum/user-role.enum';

export const userData = {
  email: 'ibf-devops@redcross.nl',
  firstName: 'Test',
  lastName: 'User',
  userRole: UserRole.Operator,
  countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
  disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
  password: 'password',
};

export const adminUserData = {
  email: 'dunant@redcross.nl',
  password: 'password',
};
