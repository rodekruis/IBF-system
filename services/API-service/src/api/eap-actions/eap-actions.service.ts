import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, IsNull, Repository } from 'typeorm';

import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { UserEntity } from '../user/user.entity';
import { CheckEapActionDto } from './dto/check-eap-action.dto';
import { AddEapActionsDto } from './dto/eap-action.dto';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';

export interface EapAction {
  Early_action: string;
  placeCode: string;
}

@Injectable()
export class EapActionsService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepository: Repository<EapActionStatusEntity>;
  @InjectRepository(EapActionEntity)
  private readonly eapActionRepository: Repository<EapActionEntity>;
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
        existingEapAction.areaOfFocusId = eapAction.areaOfFocusId as string;
        existingEapAction.month = JSON.parse(
          JSON.stringify(eapAction.month || {}),
        );
        eapActionsToSave.push(existingEapAction);
        continue;
      }

      const newEapAction = new EapActionEntity();
      newEapAction.countryCodeISO3 = eapAction.countryCodeISO3;
      newEapAction.disasterType = eapAction.disasterType;
      newEapAction.action = eapAction.action;
      newEapAction.label = eapAction.label;
      newEapAction.areaOfFocusId = eapAction.areaOfFocusId as string;
      newEapAction.month = JSON.parse(JSON.stringify(eapAction.month || {}));
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
          eapAction.eventName === 'no-name' || !eapAction.eventName
            ? IsNull()
            : eapAction.eventName,
      },
    });

    const action = new EapActionStatusEntity();
    action.status = eapAction.status;
    action.placeCode = eapAction.placeCode;
    action.eventPlaceCode = eventPlaceCode;
    action.actionChecked = actionId;

    // If no user, take default user for now
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    action.user = user;

    const newAction = await this.eapActionStatusRepository.save(action);
    return newAction;
  }

  public async checkActionExternally(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eapActions: EapAction[],
  ): Promise<void> {
    const eapActionIds = eapActions['Early_action'].split(' ');
    const actionIds = await this.eapActionRepository.find({
      where: {
        countryCodeISO3: countryCodeISO3,
        disasterType: disasterType,
        action: In(eapActionIds),
      },
    });
    if (!actionIds.length) {
      const errors = 'No actions found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }

    const placeCode = eapActions['placeCode'];
    const adminArea = await this.adminAreaRepository.findOne({
      select: ['id'],
      where: { placeCode },
    });

    // note: the below will not be able to distinguish between different open events (= typhoon only)
    const eventPlaceCode = await this.eventPlaceCodeRepository.findOne({
      where: {
        closed: false,
        disasterType: disasterType,
        adminArea: { id: adminArea.id },
      },
    });

    if (!eventPlaceCode) {
      const errors = 'No open event found to check off actions for';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }

    for (const actionId of actionIds) {
      const action = new EapActionStatusEntity();
      action.status = true;
      action.placeCode = placeCode;
      action.eventPlaceCode = eventPlaceCode;
      action.actionChecked = actionId;
      // Don't store user for now

      await this.eapActionStatusRepository.save(action);
    }
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
      .where('event.closed = false')
      .groupBy('status."actionCheckedId"')
      .addGroupBy('status."placeCode"')
      .addSelect(['MAX(status.timestamp) AS "max_timestamp"']);
    if (eventName) {
      mostRecentStatePerAction.andWhere('event."eventName" = :eventName', {
        eventName: eventName,
      });
    }

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
      .andWhere('event.closed = false');
    if (eventName) {
      eapActionsStates.andWhere('event."eventName" = :eventName', {
        eventName: eventName,
      });
    }

    const eapActions = await this.eapActionRepository
      .createQueryBuilder('action')
      .select([
        'action."areaOfFocusId" AS aof',
        'action."action"',
        'action."label"',
        'action."disasterType"',
        'action."month"',
        ':placeCode as "placeCode"',
      ])
      .setParameter('placeCode', placeCode)
      .addSelect(
        'case when status."actionCheckedId" is null then false else status.status end AS checked',
      )
      .leftJoin(
        '(' + eapActionsStates.getQuery() + ')',
        'status',
        'action.id = status."actionCheckedId" AND status."placeCode" = :placeCode',
        { placeCode },
      )
      .setParameters(eapActionsStates.getParameters())
      .where('action."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('action."disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .getRawMany();

    return eapActions;
  }
}
