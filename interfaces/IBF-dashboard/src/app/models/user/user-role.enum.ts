export enum UserRole {
  Admin = 'admin',
  LocalAdmin = 'local-admin',
  Operator = 'operator',
  Pipeline = 'pipeline',
  Viewer = 'viewer',
}

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.LocalAdmin]: 'Local Admin',
  [UserRole.Operator]: 'Operator',
  [UserRole.Pipeline]: 'Pipeline',
  [UserRole.Viewer]: 'Viewer',
};

export const USER_ROLE_RANK: Record<UserRole, number> = {
  [UserRole.Admin]: 0,
  [UserRole.LocalAdmin]: 1,
  [UserRole.Operator]: 2,
  [UserRole.Pipeline]: 3,
  [UserRole.Viewer]: 4,
};
