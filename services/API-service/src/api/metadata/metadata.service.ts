import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataService } from '../data/data.service';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Injectable()
export class MetadataService {
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(LayerMetadataEntity)
  private readonly layerRepository: Repository<LayerMetadataEntity>;
  private readonly dataService: DataService;

  public constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  public async getIndicatorsByCountry(
    countryCodeISO3,
  ): Promise<IndicatorMetadataEntity[]> {
    const indicators = await this.indicatorRepository.find({});

    const countryIndicators = indicators.filter(
      (metadata: IndicatorMetadataEntity): boolean =>
        metadata.country_codes.split(',').includes(countryCodeISO3),
    );

    const event = await this.dataService.getEventSummaryCountry(
      countryCodeISO3,
    );
    const activeTrigger = event && event.activeTrigger;
    countryIndicators.find(
      (i): boolean => i.name === 'population_affected',
    ).active = activeTrigger;

    return countryIndicators;
  }

  public async getLayersByCountry(
    countryCodeISO3,
  ): Promise<LayerMetadataEntity[]> {
    const layers = await this.layerRepository.find();

    return layers.filter((metadata: LayerMetadataEntity): boolean =>
      metadata.country_codes.split(',').includes(countryCodeISO3),
    );
  }
}
