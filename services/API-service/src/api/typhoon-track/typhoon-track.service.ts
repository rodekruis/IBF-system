import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster/disaster-type.enum';
import { EventService } from '../event/event.service';
import { TyphoonSpecificProperties } from './dto/trackpoint-details';
import { UploadTyphoonTrackDto } from './dto/upload-typhoon-track';
import { TyphoonTrackEntity } from './typhoon-track.entity';

@Injectable()
export class TyphoonTrackService {
  @InjectRepository(TyphoonTrackEntity)
  private readonly typhoonTrackRepository: Repository<TyphoonTrackEntity>;

  public constructor(
    private helperService: HelperService,
    private eventService: EventService,
  ) {}

  public async uploadTyphoonTrack(
    uploadTyphoonTrack: UploadTyphoonTrackDto,
  ): Promise<void> {
    await this.deleteDuplicates(uploadTyphoonTrack);

    await Promise.all(
      uploadTyphoonTrack.trackpointDetails.map(
        (trackpoint): Promise<InsertResult> => {
          return this.typhoonTrackRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCodeISO3: uploadTyphoonTrack.countryCodeISO3,
              leadTime: uploadTyphoonTrack.leadTime,
              eventName: uploadTyphoonTrack.eventName,
              date: new Date(),
              timestamp: new Date(),
              timestampOfTrackpoint: trackpoint.timestampOfTrackpoint,
              windspeed: trackpoint.windspeed,
              category: trackpoint.category,
              firstLandfall: trackpoint.firstLandfall,
              closestToLand: trackpoint.closestToLand,
              geom: (): string =>
                `st_asgeojson(st_MakePoint(${trackpoint.lon}, ${trackpoint.lat}))::json`,
            })
            .execute();
        },
      ),
    );
  }

  private async deleteDuplicates(
    uploadTyphoonTrack: UploadTyphoonTrackDto,
  ): Promise<void> {
    await this.typhoonTrackRepository.delete({
      countryCodeISO3: uploadTyphoonTrack.countryCodeISO3,
      eventName: uploadTyphoonTrack.eventName,
      date: new Date(),
      timestamp: MoreThanOrEqual(
        this.helperService.getLast12hourInterval(DisasterType.Typhoon),
      ),
    });
  }

  public async getTyphoonTrack(
    countryCodeISO3: string,
    leadTime: LeadTime,
    eventName: string,
  ): Promise<GeoJson> {
    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      DisasterType.Typhoon,
    );
    const typhoonTrackPoints = await this.typhoonTrackRepository.find({
      select: [
        'countryCodeISO3',
        'leadTime',
        'timestampOfTrackpoint',
        'windspeed',
        'category',
        'firstLandfall',
        'closestToLand',
        'geom',
      ],
      where: {
        leadTime: leadTime,
        countryCodeISO3: countryCodeISO3,
        date: lastTriggeredDate.date,
        eventName: eventName,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast12hourInterval(
            DisasterType.Typhoon,
            lastTriggeredDate.timestamp,
          ),
        ),
      },
    });

    return this.helperService.toGeojson(typhoonTrackPoints);
  }

  public async getTyphoonSpecificProperties(
    countryCodeISO3: string,
    leadTime: string,
    eventName: string,
  ): Promise<TyphoonSpecificProperties> {
    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      DisasterType.Typhoon,
    );

    const typhoonTrackPoints = await this.typhoonTrackRepository.find({
      select: ['timestampOfTrackpoint', 'firstLandfall', 'closestToLand'],
      where: {
        leadTime: leadTime,
        countryCodeISO3: countryCodeISO3,
        date: lastTriggeredDate.date,
        eventName: eventName,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast12hourInterval(
            DisasterType.Typhoon,
            lastTriggeredDate.timestamp,
          ),
        ),
      },
    });

    const typhoonLandfall =
      typhoonTrackPoints.filter(point => point.firstLandfall).length > 0;

    let isTyphoonNoLandfallYet = false;

    if (!typhoonLandfall) {
      const maxTimestamp = new Date(
        Math.max.apply(
          null,
          typhoonTrackPoints.map(
            point => new Date(point.timestampOfTrackpoint),
          ),
        ),
      );

      const closestToLandTimestamp = new Date(
        typhoonTrackPoints.find(
          point => point.closestToLand,
        ).timestampOfTrackpoint,
      );

      isTyphoonNoLandfallYet =
        maxTimestamp.getTime() === closestToLandTimestamp.getTime();
    }

    return {
      typhoonLandfall,
      isTyphoonNoLandfallYet,
    };
  }
}
