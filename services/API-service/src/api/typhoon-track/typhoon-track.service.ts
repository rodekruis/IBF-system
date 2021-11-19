import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster/disaster-type.enum';
import { EventService } from '../event/event.service';
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
              date: new Date(),
              timestamp: new Date(),
              timestampOfTrackpoint: trackpoint.timestampOfTrackpoint,
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
    // The update frequency is 12 hours, so dividing up in 2 12-hour intervals
    const last12hourInterval = new Date();
    if (last12hourInterval.getHours() >= 12) {
      last12hourInterval.setHours(12, 0, 0, 0);
    } else {
      last12hourInterval.setHours(0, 0, 0, 0);
    }
    await this.typhoonTrackRepository.delete({
      countryCodeISO3: uploadTyphoonTrack.countryCodeISO3,
      leadTime: uploadTyphoonTrack.leadTime,
      date: new Date(),
      timestamp: MoreThanOrEqual(last12hourInterval),
    });
  }

  public async getTyphoonTrack(
    countryCodeISO3: string,
    leadTime: LeadTime,
  ): Promise<GeoJson> {
    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      DisasterType.Typhoon,
    );
    const typhoonTrackPoints = await this.typhoonTrackRepository
      .createQueryBuilder('track')
      .select([
        '"countryCodeISO3"',
        '"leadTime"',
        '"timestampOfTrackpoint"',
        'geom',
      ])
      .where('"leadTime" = :leadTime', {
        leadTime: leadTime,
      })
      .andWhere('"countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .getRawMany();

    return this.helperService.toGeojson(typhoonTrackPoints);
  }
}
