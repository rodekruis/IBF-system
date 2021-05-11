import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedcrossBranchEntity } from './redcross-branch.entity';

@Injectable()
export class RedcrossBranchService {
    @InjectRepository(RedcrossBranchEntity)
    private readonly redcrossBranchRepository: Repository<RedcrossBranchEntity>;

    public constructor() {}

    public async getBranchesByCountry(
        countryCodeISO3,
    ): Promise<RedcrossBranchEntity[]> {
        return await this.redcrossBranchRepository.find({
            where: { countryCode: countryCodeISO3 },
        });
    }
}
