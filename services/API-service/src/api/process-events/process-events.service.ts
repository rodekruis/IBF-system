import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, UpdateResult } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { SetTriggerDto } from '../event/dto/event-place-code.dto';
import { EventService } from '../event/event.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { NotificationApiTestResponseDto } from '../notification/dto/notification-api-test-response.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProcessEventsService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  public constructor(
    private eventService: EventService,
    private helperService: HelperService,
    private notificationService: NotificationService,
  ) {}

  public async processEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const activeEventNames = await this.eventService.getActiveEventNames(
      countryCodeISO3,
      disasterType,
      lastUploadDate,
    );

    const defaultAdminLevel = (
      await this.eventService.getCountryDisasterSettings(
        countryCodeISO3,
        disasterType,
      )
    ).defaultAdminLevel;
    for (const eventName of activeEventNames) {
      if (eventName.eventName === null) {
        await this.eventService.insertAlertsPerLeadTime(
          countryCodeISO3,
          disasterType,
          null,
          [],
          lastUploadDate,
        );
        continue;
      }

      await this.eventService.processEventAreas(
        countryCodeISO3,
        disasterType,
        defaultAdminLevel,
        eventName.eventName,
        lastUploadDate,
      );
    }

    await this.eventService.closeEventsAutomatic(
      countryCodeISO3,
      disasterType,
      lastUploadDate,
    );

    return await this.notificationService.send(
      countryCodeISO3,
      disasterType,
      noNotifications,
      lastUploadDate,
    );
  }

  public async notify(
    countryCodeISO3: string,
    disasterType: DisasterType,
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    return await this.notificationService.send(
      countryCodeISO3,
      disasterType,
      noNotifications,
      lastUploadDate,
    );
  }

  public async setTrigger(
    userId: string,
    setTriggerDto: SetTriggerDto,
  ): Promise<UpdateResult> {
    const updateResult = await this.eventPlaceCodeRepo.update(
      setTriggerDto.eventPlaceCodeIds,
      { userTrigger: true, userTriggerDate: new Date(), user: { userId } },
    );

    await this.notify(
      setTriggerDto.countryCodeISO3,
      setTriggerDto.disasterType,
      setTriggerDto.noNotifications,
    );

    return updateResult;
  }
}
