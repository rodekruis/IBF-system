import { UserRole } from '@helpers/API-service/enum/user-role.enum';

export const userData = {
  'admin-multi': {
    email: 'admin-multi@redcross.nl',
    firstName: 'Multi',
    lastName: 'Admin',
    userRole: UserRole.Admin,
    countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
    disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
    password: 'password',
  },
  'local-admin-multi': {
    email: 'local-admin-multi@redcross.nl',
    firstName: 'Multi',
    lastName: 'Local Admin',
    userRole: UserRole.LocalAdmin,
    countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
    disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
    password: 'password',
  },
  'operator-multi': {
    email: 'operator-multi@redcross.nl',
    firstName: 'Multi',
    lastName: 'Operator',
    userRole: UserRole.Operator,
    countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
    disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
    password: 'password',
  },
  'pipeline-multi': {
    email: 'pipeline-multi@redcross.nl',
    firstName: 'Multi',
    lastName: 'Pipeline',
    userRole: UserRole.Pipeline,
    countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
    disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
    password: 'password',
  },
  'viewer-multi': {
    email: 'viewer-multi@redcross.nl',
    firstName: 'Multi',
    lastName: 'Viewer',
    userRole: UserRole.Viewer,
    countryCodesISO3: ['UGA', 'ZMB', 'MWI', 'SSD', 'KEN', 'ETH', 'PHL', 'ZWE'],
    disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'],
    password: 'password',
  },
};
