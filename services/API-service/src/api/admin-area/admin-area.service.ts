import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataService } from '../data/data.service';
import { AdminAreaEntity } from './admin-area.entity';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  public constructor(private readonly dataService: DataService) {}

  public async getAdminAreasByCountry(countryCode): Promise<AdminAreaEntity[]> {
    const adminAreas = await this.adminAreaRepository.find({});

    const countryAdminAreas = adminAreas.filter(i =>
      i.country_codes.split(',').includes(countryCode),
    );

    const event = await this.dataService.getEvent(countryCode);
    const activeTrigger = event && !event.end_date;
    countryAdminAreas.find(
      (i): boolean => i.name === 'population_affected',
    ).active = activeTrigger;

    return countryAdminAreas;
  }
}
