import { UserRole } from '../helpers/API-service/enum/user-role.enum';

export const userData = {
  email: 'dunant@redcross.nl',
  firstName: 'Henry',
  middleName: 'string',
  lastName: 'Dunant',
  role: UserRole.DisasterManager,
  countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
  disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
  password: 'password',
  whatsappNumber: '+31612345678',
};
