import { UserRole } from '../../../services/API-service/src/api/user/user-role.enum';
import { UserStatus } from '../../../services/API-service/src/api/user/user-status.enum';

// REFACTOR: it will happen a lot throughout these integration tests to use DTO's from the API-service. Is it fine to import them like this?
export const userData = {
  email: 'dunant@redcross.nl',
  username: 'dunant',
  firstName: 'Henry',
  middleName: 'string',
  lastName: 'Dunant',
  role: UserRole.DisasterManager,
  countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
  disasterTypes: [
    'floods',
    'heavy-rain',
    'malaria',
    'drought',
    'typhoon',
    'flash-floods',
  ],
  status: UserStatus.Active,
  password: 'password',
  whatsappNumber: '+31612345678',
};
