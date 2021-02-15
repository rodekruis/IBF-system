import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionDto } from './dto/eap-action.dto';
import { AreaOfFocusEntity } from './area-of-focus.entity';

@Injectable()
export class EapActionsService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepository: Repository<EapActionStatusEntity>;
  @InjectRepository(EapActionEntity)
  private readonly eapActionRepository: Repository<EapActionEntity>;
  @InjectRepository(AreaOfFocusEntity)
  private readonly areaOfFocusRepository: Repository<AreaOfFocusEntity>;

  private manager: EntityManager;

  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public async checkAction(
    userId: string,
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
    action.event = eapAction.event;
    action.actionChecked = actionId;

    // If no user, take default user for now
    const user = await this.userRepository.findOne(userId);
    action.user = user;

    const newAction = await this.eapActionStatusRepository.save(action);
    return newAction;
  }

  public async getAreasOfFocus(): Promise<AreaOfFocusEntity[]> {
    return await this.areaOfFocusRepository.find();
  }

  public async getActionsWithStatus(
    countryCode: string,
    pcode: string,
    event: number,
  ): Promise<EapActionEntity[]> {
    const query =
      'select aof.label as "aofLabel" \
        , aof.id as aof \
        , "action" \
        , ea."label" \
        , \'' +
      pcode +
      '\' as pcode \
        , case when eas."actionCheckedId" is null then false else eas.status end as checked \
      from "IBF-app"."eap-action" ea \
      left join "IBF-app"."area-of-focus" aof \
        on ea."areaOfFocusId" = aof.id \
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
        and event = $2 \
      ) eas \
      on ea.id = eas."actionCheckedId" \
      and \'' +
      pcode +
      '\' = eas.pcode \
      where "countryCode" = $1 \
    ';

    const actions: EapActionEntity[] = await this.manager.query(query, [
      countryCode,
      event,
    ]);

    return actions;
  }
}
