import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

export class User {
  public userId: string;
  public email: string;
  public username: string;
  public firstName: string;
  public middleName?: string;
  public lastName: string;
  public userRole: UserRole;
  public userStatus: UserStatus;
  public countries: string[];
  public disasterTypes: string[];
  public exp: number;
  public iat: number;
}

export class UserData {
  @ApiProperty({ example: 'dunant@redcross.nl' })
  public email: string;

  @ApiProperty({
    example:
      'this-is-an-example-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YmI2ZDFmZi1jMzMyLTRiZGEtOGIyMi0zNTA1ZjE0MTA5MDYiLCJlbWFpbCI6ImR1bmFudEByZWRjcm9zcy5ubCIsInVzZXJuYW1lIjoiZHVuYW50IiwiZmlyc3ROYW1lIjoiSGVucnkiLCJtaWRkbGVOYW1lIjpudWxsLCJsYXN0TmFtZSI6IkR1bmFudCIsInVzZXJSb2xlIjoiYWRtaW4iLCJ1c2VyU3RhdHVzIjoiYWN0aXZlIiwiY291bnRyaWVzIjpbIlVHQSIsIlpNQiIsIktFTiIsIkVUSCIsIkVHWSIsIlBITCJdLCJleHAiOjE2MjgyNDE4NDEuODg5LCJpYXQiOjE2MjMwNTc4NDF9.HNRmmrlKjASGjPIdSVDqpYKbWyXrrpr53iqof9tx2PU',
  })
  public token: string;

  @ApiProperty({
    example: UserRole.DisasterManager,
  })
  public userRole: UserRole;
}

export class UserResponseObject {
  @ApiProperty({ type: UserData })
  public user: UserData;
}
