import { UserRole } from '../helpers/API-service/enum/user-role.enum';
import { UserStatus } from '../helpers/API-service/enum/user-status.enum';

export const userData = {
  email: 'dunant@redcross.nl',
  username: 'dunant',
  firstName: 'Henry',
  middleName: 'string',
  lastName: 'Dunant',
  role: UserRole.DisasterManager,
  countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
  disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
  status: UserStatus.Active,
  password: 'password',
  whatsappNumber: '+31612345678',
};
