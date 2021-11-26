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
              eventName: uploadTyphoonTrack.eventName,
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
  ): Promise<GeoJson> {
    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      DisasterType.Typhoon,
    );
    const typhoonTrackPoints = await this.typhoonTrackRepository.find({
      select: ['countryCodeISO3', 'leadTime', 'timestampOfTrackpoint', 'geom'],
      where: {
        leadTime: leadTime,
        countryCodeISO3: countryCodeISO3,
        date: lastTriggeredDate.date,
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
}
