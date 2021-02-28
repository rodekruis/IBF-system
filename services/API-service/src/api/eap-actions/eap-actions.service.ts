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

    const query = `select
        id
      from
        "IBF-pipeline-output".event_pcode
      where
        closed = false
        and pcode = $1`;

    const eventPlaceCodeId = await this.manager.query(query, [
      eapAction.pcode,
    ])[0]['id'];

    const action = new EapActionStatusEntity();
    action.status = eapAction.status;
    action.pcode = eapAction.pcode;
    action.event = eventPlaceCodeId;
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
  ): Promise<EapActionEntity[]> {
    const query = `select
        aof.label as "aofLabel" ,
        aof.id as aof ,
        "action" ,
        ea."label" ,
        $1 as pcode,
        case
          when eas."actionCheckedId" is null then false
          else eas.status
        end as checked
      from
        "IBF-app"."eap-action" ea
      left join "IBF-app"."area-of-focus" aof on
        ea."areaOfFocusId" = aof.id
      left join(
        select
          t1.*
        from
          "IBF-app"."eap-action-status" t1
        left join(
          select
            "actionCheckedId",
            pcode ,
            max(timestamp) as max_timestamp
          from
            "IBF-app"."eap-action-status"
          group by
            1,
            2 ) t2 on
          t1."actionCheckedId" = t2."actionCheckedId"
        where
          timestamp = max_timestamp
          and event = any( (
          select
            array_agg(id)
          from
            "IBF-pipeline-output".event_pcode where closed = false)::int[]) ) eas on
        ea.id = eas."actionCheckedId"
        and pcode = eas.pcode
      where
        "countryCode" = $2`;

    const actions: EapActionEntity[] = await this.manager.query(query, [
      pcode,
      countryCode,
    ]);

    return actions;
  }
}
