import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { IsNull, Repository } from 'typeorm';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { CheckEapActionDto } from './dto/check-eap-action.dto';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { AddEapActionsDto } from './dto/eap-action.dto';

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
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepository: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  public async addOrUpdateEapActions(
    eapActions: AddEapActionsDto,
  ): Promise<EapActionEntity[]> {
    const eapActionsToSave = [];
    for await (const eapAction of eapActions.eapActions) {
      const existingEapAction = await this.eapActionRepository.findOne({
        where: {
          countryCodeISO3: eapAction.countryCodeISO3,
          disasterType: eapAction.disasterType,
          action: eapAction.action,
        },
      });
      if (existingEapAction) {
        existingEapAction.label = eapAction.label;
        existingEapAction.areaOfFocus = eapAction.areaOfFocus;
        existingEapAction.month = eapAction.month;
        eapActionsToSave.push(existingEapAction);
        continue;
      }

      const newEapAction = new EapActionEntity();
      newEapAction.countryCodeISO3 = eapAction.countryCodeISO3;
      newEapAction.disasterType = eapAction.disasterType;
      newEapAction.action = eapAction.action;
      newEapAction.label = eapAction.label;
      newEapAction.areaOfFocus = eapAction.areaOfFocus;
      newEapAction.month = eapAction.month;
      eapActionsToSave.push(newEapAction);
    }
    return await this.eapActionRepository.save(eapActionsToSave);
  }

  public async checkAction(
    userId: string,
    eapAction: CheckEapActionDto,
  ): Promise<EapActionStatusEntity> {
    const actionId = await this.eapActionRepository.findOne({
      where: {
        countryCodeISO3: eapAction.countryCodeISO3,
        disasterType: eapAction.disasterType,
        action: eapAction.action,
      },
    });
    if (!actionId) {
      const errors = 'Action not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }

    const adminArea = await this.adminAreaRepository.findOne({
      select: ['id'],
      where: { placeCode: eapAction.placeCode },
    });

    const eventPlaceCode = await this.eventPlaceCodeRepository.findOne({
      where: {
        closed: false,
        disasterType: eapAction.disasterType,
        adminArea: { id: adminArea.id },
        eventName:
          eapAction.eventName === 'no-name' ? IsNull() : eapAction.eventName,
      },
    });

    const action = new EapActionStatusEntity();
    action.status = eapAction.status;
    action.placeCode = eapAction.placeCode;
    action.eventPlaceCode = eventPlaceCode;
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
    countryCodeISO3: string,
    disasterType: string,
    placeCode: string,
    eventName: string,
  ): Promise<EapActionEntity[]> {
    const mostRecentStatePerAction = this.eapActionStatusRepository
      .createQueryBuilder('status')
      .select(['status."actionCheckedId"', 'status."placeCode"'])
      .leftJoin('status.eventPlaceCode', 'event')
      .where('coalesce(event."eventName",\'null\') = :eventName', {
        eventName: eventName || 'null',
      })
      .andWhere('event.closed = false')
      .groupBy('status."actionCheckedId"')
      .addGroupBy('status."placeCode"')
      .addSelect(['MAX(status.timestamp) AS "max_timestamp"']);

    const eapActionsStates = this.eapActionStatusRepository
      .createQueryBuilder('status')
      .select([
        'status."actionCheckedId"',
        'status."placeCode"',
        'status."status"',
      ])
      .leftJoin(
        '(' + mostRecentStatePerAction.getQuery() + ')',
        'recent',
        'status."actionCheckedId" = recent."actionCheckedId"',
      )
      .setParameters(mostRecentStatePerAction.getParameters())
      .leftJoin('status.eventPlaceCode', 'event')
      .where('status.timestamp = recent.max_timestamp')
      .andWhere('coalesce(event."eventName",\'null\') = :eventName', {
        eventName: eventName || 'null',
      })
      .andWhere('event.closed = false');

    const eapActions = await this.eapActionRepository
      .createQueryBuilder('action')
      .select([
        'area."label" AS "aofLabel"',
        'area.id AS aof',
        'action."action"',
        'action."label"',
        'action."disasterType"',
        'action."month"',
      ])
      .addSelect(
        'case when status."actionCheckedId" is null then false else status.status end AS checked',
      )
      .leftJoin(
        '(' + eapActionsStates.getQuery() + ')',
        'status',
        'action.id = status."actionCheckedId" AND status."placeCode" = :placeCode',
        { placeCode: placeCode },
      )
      .setParameters(eapActionsStates.getParameters())
      .leftJoin('action.areaOfFocus', 'area')
      .where('action."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('action."disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .getRawMany();

    eapActions.forEach(action => (action['placeCode'] = placeCode));

    return eapActions;
  }
}
