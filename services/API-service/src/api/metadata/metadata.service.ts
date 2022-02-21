import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterType } from '../disaster/disaster-type.enum';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Injectable()
export class MetadataService {
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(LayerMetadataEntity)
  private readonly layerRepository: Repository<LayerMetadataEntity>;

  public async getIndicatorsByCountryAndDisaster(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<IndicatorMetadataEntity[]> {
    const indicators = await this.indicatorRepository.find({
      relations: ['disasterTypes'],
    });
    return indicators.filter(
      (metadata: IndicatorMetadataEntity): boolean =>
        metadata.country_codes.split(',').includes(countryCodeISO3) &&
        metadata.disasterTypes.map(d => d.disasterType).includes(disasterType),
    );
  }

  public async getLayersByCountryAndDisaster(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LayerMetadataEntity[]> {
    const layers = await this.layerRepository.find({
      relations: ['disasterTypes'],
    });

    return layers.filter(
      (metadata: LayerMetadataEntity): boolean =>
        metadata.country_codes.split(',').includes(countryCodeISO3) &&
        metadata.disasterTypes.map(d => d.disasterType).includes(disasterType),
    );
  }
}
