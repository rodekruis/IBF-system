import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlofasStationEntity } from './glofas-station.entity';

@Injectable()
export class GlofasStationService {
  @InjectRepository(GlofasStationEntity)
  private readonly glofasStationRepository: Repository<GlofasStationEntity>;

  public constructor() {}
}
