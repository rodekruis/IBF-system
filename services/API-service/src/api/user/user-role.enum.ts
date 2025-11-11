export enum UserRole {
  Admin = 'admin',
  LocalAdmin = 'local-admin',
  Operator = 'operator',
  PipelineUser = 'pipeline-user',
  Viewer = 'viewer',
}

export const USER_ROLE_RANK: Record<UserRole, number> = {
  [UserRole.Admin]: 0,
  [UserRole.LocalAdmin]: 1,
  [UserRole.Operator]: 2,
  [UserRole.PipelineUser]: 3,
  [UserRole.Viewer]: 4,
};
