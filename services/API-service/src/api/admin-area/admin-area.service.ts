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
            select: ['countryCodeISO3', 'name', 'placeCode', 'geom'],
            where: { countryCodeISO3: countryCodeISO3 },
        });
    }

    public async getStationAdminAreaMappingByCountry(
        countryCodeISO3,
    ): Promise<any[]> {
        return await this.adminAreaRepository.find({
            select: ['countryCodeISO3', 'name', 'placeCode', 'glofasStation'],
            where: { countryCodeISO3: countryCodeISO3 },
        });
    }
}
