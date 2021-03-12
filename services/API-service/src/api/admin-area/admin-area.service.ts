import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { AdminAreaEntity } from './admin-area.entity';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  public constructor() {}

  public async getStationAdminAreaMappingByCountry(
    countryCodeISO3,
  ): Promise<any[]> {
    return await this.adminAreaRepository.find({
      select: ['countryCode', 'name', 'pcode', 'glofasStation'],
      where: { countryCode: countryCodeISO3 },
    });
  }
}
