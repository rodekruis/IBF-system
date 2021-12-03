import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster/disaster-type.enum';
import { EventService } from '../event/event.service';
import { UploadVulnerableGroupsDto } from './dto/upload-vulnerable-groups';
import { VulnerableGroupsEntity } from './vulnerable-groups.entity';

@Injectable()
export class VulnerableGroupsService {
  @InjectRepository(VulnerableGroupsEntity)
  private readonly vulnerableGroupsRepository: Repository<VulnerableGroupsEntity>;

  public constructor(
    private helperService: HelperService,
    private eventService: EventService,
  ) {}

  public async uploadVulnerableGroups(
    uploadVulnerableGroups: UploadVulnerableGroupsDto,
  ): Promise<void> {
    await this.deleteDuplicates(uploadVulnerableGroups);

    await Promise.all(
      uploadVulnerableGroups.vulnerableGroupsDetails.map(
        (vulnerableGroups): Promise<InsertResult> => {
          return this.vulnerableGroupsRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCodeISO3: uploadVulnerableGroups.countryCodeISO3,
              leadTime: uploadVulnerableGroups.leadTime,
              eventName: uploadVulnerableGroups.eventName,
              date: new Date(),
              timestamp: new Date(),
              timestampOfVulnerableGroups: vulnerableGroups.timestampOfVulnerableGroups,
              geom: (): string =>
                `st_asgeojson(st_MakePoint(${vulnerableGroups.lon}, ${vulnerableGroups.lat}))::json`,
            })
            .execute();
        },
      ),
    );
  }

  private async deleteDuplicates(
    uploadVulnerableGroups: UploadVulnerableGroupsDto,
  ): Promise<void> {
    await this.vulnerableGroupsRepository.delete({
      countryCodeISO3: uploadVulnerableGroups.countryCodeISO3,
      eventName: uploadVulnerableGroups.eventName,
      date: new Date(),
      timestamp: MoreThanOrEqual(
        this.helperService.getLast12hourInterval(DisasterType.Typhoon),
      ),
    });
  }

  public async getVulnerableGroups(
    countryCodeISO3: string,
    leadTime: LeadTime,
  ): Promise<GeoJson> {
    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      DisasterType.Typhoon,
    );
    const vulnerableGroups = await this.vulnerableGroupsRepository.find({
      select: ['countryCodeISO3', 'leadTime', 'timestampOfVulnerableGroups', 'geom'],
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

    return this.helperService.toGeojson(vulnerableGroups);
  }
}
