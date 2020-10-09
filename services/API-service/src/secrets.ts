import { CountryStatus } from './country/country-status.enum';
import { UserRole } from './user/user-role.enum';
import { UserStatus } from './user/user-status.enum';

export const SECRET = process.env.SECRET;

export const USERCONFIGS = [
  {
    email: 'dunant@redcross.nl',
    username: 'dunant',
    firstName: 'Henry',
    lastName: 'Dunant',
    role: UserRole.Admin,
    password: 'password',
    status: UserStatus.Active,
    countries: ['UGA', 'ZMB'],
  },
  {
    email: 'uganda@redcross.nl',
    username: 'uganda',
    firstName: 'Uganda',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['UGA'],
  },
  {
    email: 'zambia@redcross.nl',
    username: 'zambia',
    firstName: 'Zambia',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['ZMB'],
  },
  {
    email: 'kenya@redcross.nl',
    username: 'kenya',
    firstName: 'Kenya',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['KEN'],
  },
  {
    email: 'egypt@redcross.nl',
    username: 'egypt',
    firstName: 'Egypt',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['EGY'],
  },
];

export const COUNTRYCONFIGS = [
  {
    countryCode: 'UGA',
    countryName: 'Uganda',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'ZMB',
    countryName: 'Zambia',
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
