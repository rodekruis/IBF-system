import {
  LeadTime,
  LeadTimeUnit,
} from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { LookupService } from '../notification/lookup/lookup.service';
import { UserRole } from './user-role.enum';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

const disasterTypes: DisasterTypeEntity[] = [
  {
    id: '1',
    disasterType: DisasterType.Floods,
    label: 'Floods',
    triggerIndicator: 'population_affected',
    mainExposureIndicator: 'population_affected',
    showOnlyTriggeredAreas: false,
    countries: [],
    leadTimeUnit: LeadTimeUnit.day,
    minLeadTime: LeadTime.day1,
    maxLeadTime: LeadTime.day7,
    users: [],
  },
];

const user: UserEntity = {
  userId: '1',
  email: 'test@example.org',
  whatsappNumber: '+3100000000',
  firstName: 'Test',
  middleName: 'User',
  lastName: 'Example',
  userRole: UserRole.DisasterManager,
  countries: [],
  disasterTypes: disasterTypes,
  password: '',
  created: new Date(),
  hashPassword: function (): void {
    throw new Error('Function not implemented.');
  },
  actions: [],
  stoppedTriggers: [],
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    userService = new UserService(new LookupService());
  });

  describe('generateJWT', () => {
    it('should generate a JWT token of type string and starting with the characters "eyJ"', async () => {
      const generated = await userService.generateJWT(user);
      const expectedFirstCharacters = 'eyJ';
      expect(typeof generated).toBe('string');
      expect(generated.indexOf(expectedFirstCharacters)).toBe(0);
    });
  });
});
