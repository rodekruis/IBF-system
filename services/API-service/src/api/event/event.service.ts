/* eslint-disable @typescript-eslint/camelcase */
import { EventPcodeEntity } from './event-pcode.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventPcodeDto } from './dto/event-pcode.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventService {
  @InjectRepository(EventPcodeEntity)
  private readonly eventPcodeRepo: Repository<EventPcodeEntity>;

  public async closeEventPcode(eventPcodeDto: EventPcodeDto): Promise<void> {
    console.log('closeDistrictEventDto: ', eventPcodeDto);

    const eventPcode = await this.eventPcodeRepo.findOne(
      eventPcodeDto.eventPcodeId,
    );
    if (!eventPcode) {
      const errors = 'Event Pcode not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    eventPcode.closed = true;
    eventPcode.manual_closed_date = new Date();
    await this.eventPcodeRepo.save(eventPcode);
  }
}
