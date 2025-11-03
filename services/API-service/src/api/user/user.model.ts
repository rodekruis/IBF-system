import { ApiProperty } from '@nestjs/swagger';

import { DUNANT_EMAIL } from '../../config';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from './user-role.enum';

export class User {
  public userId: string;
  public email: string;
  public firstName: string;
  public middleName?: string;
  public lastName: string;
  public userRole: UserRole;
  public countries: string[];
  public disasterTypes: DisasterType[];
  public exp: number;
  public iat: number;
}

export class UserData {
  @ApiProperty({ example: DUNANT_EMAIL })
  public email: string;

  @ApiProperty({ example: 'Henry' })
  public firstName: string;

  @ApiProperty({ default: null })
  public middleName?: string;

  @ApiProperty({ example: 'Dunant' })
  public lastName: string;

  @ApiProperty({ example: UserRole.Operator })
  public userRole: UserRole;

  @ApiProperty({ example: '+31600000000' })
  public whatsappNumber: string;

  @ApiProperty({
    example:
      'this-is-an-example-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YmI2ZDFmZi1jMzMyLTRiZGEtOGIyMi0zNTA1ZjE0MTA5MDYiLCJlbWFpbCI6ImR1bmFudEByZWRjcm9zcy5ubCIsInVzZXJuYW1lIjoiZHVuYW50IiwiZmlyc3ROYW1lIjoiSGVucnkiLCJtaWRkbGVOYW1lIjpudWxsLCJsYXN0TmFtZSI6IkR1bmFudCIsInVzZXJSb2xlIjoiYWRtaW4iLCJ1c2VyU3RhdHVzIjoiYWN0aXZlIiwiY291bnRyaWVzIjpbIlVHQSIsIlpNQiIsIktFTiIsIkVUSCIsIkVHWSIsIlBITCJdLCJleHAiOjE2MjgyNDE4NDEuODg5LCJpYXQiOjE2MjMwNTc4NDF9.HNRmmrlKjASGjPIdSVDqpYKbWyXrrpr53iqof9tx2PU',
  })
  public token?: string;

  @ApiProperty({ example: ['NLD', 'ETH'] })
  public countries: string[];

  @ApiProperty({ example: [DisasterType.Floods, DisasterType.Drought] })
  public disasterTypes: DisasterType[];
}

export class UserResponseObject {
  @ApiProperty({ type: UserData })
  public user: UserData;
}
