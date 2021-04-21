/* eslint-disable @typescript-eslint/camelcase */
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventPlaceCodeDto } from './dto/event-place-code.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;

  public async closeEventPcode(
    eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    console.log('EventPlaceCodeDto: ', eventPlaceCodeDto);
    const eventPlaceCode = await this.eventPlaceCodeRepo.findOne(
      eventPlaceCodeDto.eventPlaceCodeId,
    );
    if (!eventPlaceCode) {
      const errors = 'Event placeCode not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    eventPlaceCode.closed = true;
    eventPlaceCode.manualClosedDate = new Date();
    await this.eventPlaceCodeRepo.save(eventPlaceCode);
  }
}
