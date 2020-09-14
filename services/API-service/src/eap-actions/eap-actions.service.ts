import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionDto } from './dto/eap-action.dto';

@Injectable()
export class EapActionsService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepository: Repository<EapActionStatusEntity>;
  @InjectRepository(EapActionEntity)
  private readonly eapActionRepository: Repository<EapActionEntity>;

  public constructor() {}

  public async checkAction(
    userId: number,
    eapAction: EapActionDto,
  ): Promise<EapActionStatusEntity> {
    const actionId = await this.eapActionRepository.findOne({
      where: {
        countryCode: eapAction.countryCode,
        action: eapAction.action,
      },
    });
    if (!actionId) {
      const errors = 'Action not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }

    const action = new EapActionStatusEntity();
    action.actionChecked = actionId;

    // If no user, take default user for now
    const user = await this.userRepository.findOne(userId ? userId : 1);
    action.user = user;

    const newAction = await this.eapActionStatusRepository.save(action);
    return newAction;
  }

  public async getActionsWithStatus(
    countryCode: string,
  ): Promise<EapActionEntity[]> {
    const actions = this.eapActionRepository
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.checked', 'status')
      .where('action.countryCode = :countryCode', { countryCode })
      .select([
        'action.action as action',
        'action.label as label',
        'case when status."actionCheckedId" is null then 0 else 1 end as checked',
      ])
      .execute();
    return actions;
  }
}
