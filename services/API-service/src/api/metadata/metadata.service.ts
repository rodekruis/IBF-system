import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryService } from '../country/country.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { EventService } from '../event/event.service';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Injectable()
export class MetadataService {
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(LayerMetadataEntity)
  private readonly layerRepository: Repository<LayerMetadataEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;

  private countryService: CountryService;
  private readonly eventService: EventService;

  public constructor(
    countryService: CountryService,
    eventService: EventService,
  ) {
    this.countryService = countryService;
    this.eventService = eventService;
  }

  public async getIndicatorsByCountry(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<IndicatorMetadataEntity[]> {
    const event = await this.eventService.getEventSummaryCountry(
      countryCodeISO3,
      disasterType,
    );
    const activeTrigger = event && event.activeTrigger;

    const indicators = await this.indicatorRepository.find({});

    let countryIndicators = [];
    if (activeTrigger) {
      countryIndicators = indicators.filter(
        (metadata: IndicatorMetadataEntity): boolean =>
          metadata.country_codes.split(',').includes(countryCodeISO3) &&
          this.checkDisasterType(metadata, disasterType),
      );
    } else {
      countryIndicators = indicators.filter(
        (metadata: IndicatorMetadataEntity): boolean =>
          metadata.country_codes.split(',').includes(countryCodeISO3) &&
          this.checkDisasterType(metadata, disasterType) &&
          metadata.group !== 'outline',
      );
    }

    const actionUnit = await this.getActionUnit(disasterType);

    const countryActionUnit = countryIndicators.find(
      (i): boolean => actionUnit === i.name,
    );

    if (!countryActionUnit.active) {
      countryIndicators.find(
        (i): boolean => actionUnit === i.name,
      ).active = activeTrigger;
    }

    return countryIndicators;
  }

  public async getLayersByCountry(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LayerMetadataEntity[]> {
    const layers = await this.layerRepository.find();

    return layers.filter(
      (metadata: LayerMetadataEntity): boolean =>
        metadata.country_codes.split(',').includes(countryCodeISO3) &&
        this.checkDisasterType(metadata, disasterType),
    );
  }

  private async getActionUnit(disasterType: DisasterType): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['actionsUnit'],
        where: { disasterType: disasterType },
      })
    ).actionsUnit;
  }

  private checkDisasterType(metadata, disasterType): boolean {
    return metadata.disasterType === disasterType || !metadata.disasterType;
  }
}
