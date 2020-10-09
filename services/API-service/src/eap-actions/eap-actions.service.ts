import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { EntityManager, Repository } from 'typeorm';
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

  public constructor(private manager: EntityManager) {}

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
    action.status = eapAction.status;
    action.pcode = eapAction.pcode;
    action.actionChecked = actionId;

    // If no user, take default user for now
    const user = await this.userRepository.findOne(userId ? userId : 1);
    action.user = user;

    const newAction = await this.eapActionStatusRepository.save(action);
    return newAction;
  }

  public async getActionsWithStatus(
    countryCode: string,
    pcode: string,
  ): Promise<EapActionEntity[]> {
    const query =
      'select "areaOfFocus" as aof \
        , "action" \
        , "label" \
        , \'' +
      pcode +
      '\' as pcode \
        , case when eas."actionCheckedId" is null then false else eas.status end as checked \
      from "IBF-app"."eap-action" ea \
      left join( \
        select t1.* \
        from "IBF-app"."eap-action-status" t1 \
	      left join( \
          select "actionCheckedId",pcode \
            , max(timestamp) as max_timestamp \
          from "IBF-app"."eap-action-status" \
          group by 1,2 \
          ) t2 \
        on t1."actionCheckedId" = t2."actionCheckedId" \
        where timestamp = max_timestamp \
      ) eas \
      on ea.id = eas."actionCheckedId" \
      and \'' +
      pcode +
      '\' = eas.pcode \
      where "countryCode" = $1 \
    ';

    const actions: any[] = await this.manager.query(query, [countryCode]);

    return actions;
  }
}
