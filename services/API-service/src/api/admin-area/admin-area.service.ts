import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { AdminAreaEntity } from './admin-area.entity';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  public constructor() {}

  public async getAdminAreas(countryCodeISO3): Promise<any[]> {
    return await this.adminAreaRepository.find({
      select: ['countryCode', 'name', 'placeCode', 'geom'],
      where: { countryCode: countryCodeISO3 },
    });
    // return await getManager()
    //   .createQueryBuilder()
    //   .select('"countryCode", name, "placeCode", geom AS geometry')
    //   .from(AdminAreaEntity, 'adminArea')
    //   .where('"adminArea"."countryCode" = :countryCodeISO3', {
    //     countryCodeISO3,
    //   })
    //   .getRawMany();
  }

  public async getStationAdminAreaMappingByCountry(
    countryCodeISO3,
  ): Promise<any[]> {
    return await this.adminAreaRepository.find({
      select: ['countryCode', 'name', 'placeCode', 'glofasStation'],
      where: { countryCode: countryCodeISO3 },
    });
  }
}
