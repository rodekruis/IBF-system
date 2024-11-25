import {
  LeadTime,
  LeadTimeUnit,
} from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LookupService } from '../notification/lookup/lookup.service';
import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

const disasters: DisasterEntity[] = [
  {
    id: '1',
    disasterType: DisasterType.Floods,
    label: 'Floods',
    triggerUnit: 'population_affected',
    actionsUnit: 'population_affected',
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
  username: 'test@example.org',
  firstName: 'Test',
  middleName: 'User',
  lastName: 'Example',
  userRole: UserRole.DisasterManager,
  countries: [],
  disasterTypes: disasters,
  userStatus: UserStatus.Active,
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
