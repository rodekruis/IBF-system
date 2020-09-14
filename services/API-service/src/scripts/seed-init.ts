import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { USERCONFIG } from '../secrets';
import crypto from 'crypto';
import { EapActionEntity } from '../eap-actions/eap-action.entity';

@Injectable()
export class SeedInit implements InterfaceScript {
  public constructor(private connection: Connection) {}

  public async run(): Promise<void> {
    await this.connection.dropDatabase();
    await this.connection.synchronize(true);

    // ***** CREATE ADMIN USER *****

    const userRepository = this.connection.getRepository(UserEntity);
    await userRepository.save([
      {
        username: USERCONFIG.username,
        password: crypto
          .createHmac('sha256', USERCONFIG.password)
          .digest('hex'),
      },
    ]);

    // ***** CREATE EAP ACTIONS *****

    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save([
      {
        countryCode: 'UGA',
        action: 'act1',
        label: 'Action 1',
      },
      {
        countryCode: 'UGA',
        action: 'act2',
        label: 'Action 2',
      },
      {
        countryCode: 'ZMB',
        action: 'act1',
        label: 'Action 1',
      },
      {
        countryCode: 'ZMB',
        action: 'act2',
        label: 'Action 2',
      },
    ]);
  }
}

export default SeedInit;
