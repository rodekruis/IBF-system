import { CountryStatus } from './country/country-status.enum';
import { UserRole } from './user/user-role.enum';
import { UserStatus } from './user/user-status.enum';

export const SECRET = process.env.SECRET;

export const USERCONFIG = {
  email: 'dunant@redcross.nl',
  username: 'dunant',
  firstName: 'Henry',
  lastName: 'Dunant',
  role: UserRole.Admin,
  password: 'password',
  status: UserStatus.Active,
};

export const COUNTRYCONFIGS = [
  {
    countryCode: 'UGA',
    countryName: 'Uganda',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'ZMB',
    countryName: 'Zimbabwe',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'KEN',
    countryName: 'Kenya',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'EGY',
    countryName: 'Egypt',
    status: CountryStatus.Active,
  },
];
