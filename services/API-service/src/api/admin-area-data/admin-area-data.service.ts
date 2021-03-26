import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { AdminAreaDataEntity } from './admin-area-data.entity';

@Injectable()
export class AdminAreaDataService {
  @InjectRepository(AdminAreaDataEntity)
  private readonly adminAreaDataRepository: Repository<AdminAreaDataEntity>;

  public constructor() {}
}
