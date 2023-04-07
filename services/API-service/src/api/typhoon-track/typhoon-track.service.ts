import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';
import { DisasterSpecificProperties } from '../../shared/data.model';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { TyphoonCategory } from './dto/trackpoint-details';
import { UploadTyphoonTrackDto } from './dto/upload-typhoon-track';
import { TyphoonTrackEntity } from './typhoon-track.entity';

@Injectable()
export class TyphoonTrackService {
  @InjectRepository(TyphoonTrackEntity)
  private readonly typhoonTrackRepository: Repository<TyphoonTrackEntity>;

  public constructor(private helperService: HelperService) {}

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
              date: uploadTyphoonTrack.date || new Date(),
              timestamp: uploadTyphoonTrack.date || new Date(),
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
      date: uploadTyphoonTrack.date || new Date(),
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          DisasterType.Typhoon,
          uploadTyphoonTrack.date,
        ),
      ),
    });
  }

  public async getTyphoonTrack(
    countryCodeISO3: string,
    eventName: string,
  ): Promise<GeoJson> {
    const filters = await this.getTrackFilters(countryCodeISO3, eventName);
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
      where: filters,
    });

    return this.helperService.toGeojson(typhoonTrackPoints);
  }

  public async shouldSendNotification(
    countryCodeISO3: string,
    eventName: string,
  ) {
    const notificationCategories = [
      TyphoonCategory.STS,
      TyphoonCategory.TY,
      TyphoonCategory.STY,
    ];

    const filters = await this.getTrackFilters(countryCodeISO3, eventName);
    const result = await this.typhoonTrackRepository
      .createQueryBuilder('track')
      .where(filters)
      .andWhere('category IN(:...categories)', {
        categories: notificationCategories,
      })
      .getRawMany();
    return result?.length > 0 ? true : false;
  }

  private async getTrackFilters(countryCodeISO3: string, eventName: string) {
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      DisasterType.Typhoon,
    );
    const filters = {
      countryCodeISO3: countryCodeISO3,
      date: lastTriggeredDate.date,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          DisasterType.Typhoon,
          lastTriggeredDate.timestamp,
        ),
      ),
    };
    if (eventName) {
      filters['eventName'] = eventName;
    }
    return filters;
  }

  public async getTyphoonSpecificProperties(
    countryCodeISO3: string,
    eventName: string,
  ): Promise<DisasterSpecificProperties> {
    const filters = await this.getTrackFilters(countryCodeISO3, eventName);
    const typhoonTrackPoints = await this.typhoonTrackRepository.find({
      select: ['timestampOfTrackpoint', 'firstLandfall', 'closestToLand'],
      where: filters,
    });
    const landfallTrackPoint = typhoonTrackPoints.filter(
      point => point.firstLandfall,
    );
    const typhoonLandfall = landfallTrackPoint.length > 0;

    let typhoonNoLandfallYet = false;
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

      typhoonNoLandfallYet =
        maxTimestamp.getTime() === closestToLandTimestamp.getTime();
    }

    return {
      typhoonLandfall,
      typhoonNoLandfallYet,
    };
  }
}
