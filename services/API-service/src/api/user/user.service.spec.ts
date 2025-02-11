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
  disasterTypes: disasterTypes, // NOTE: if this is passed as empty array, a mock for disasterRepository.find() is needed
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

  describe('buildUserRO', () => {
    it('should generate an object including a JWT token starting with the characters "eyJ"', async () => {
      // Arrange
      const includeToken = true;

      // Act
      const userRO = await userService.buildUserRO(user, includeToken);

      // Assert
      const expectedFirstCharacters = 'eyJ';
      expect(userRO.user.token).toBeDefined();
      expect(userRO.user.token?.indexOf(expectedFirstCharacters)).toBe(0);
    });

    it('should generate an object without a JWT token when instructed as such', async () => {
      // Arrange
      const includeToken = false;

      // Act
      const userRO = await userService.buildUserRO(user, includeToken);

      // Assert
      expect(userRO.user).toBeDefined();
      expect(userRO.user.token).not.toBeDefined();
    });
  });
});
