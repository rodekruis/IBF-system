import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAreaEntity } from './admin-area.entity';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  public constructor() {}
}
