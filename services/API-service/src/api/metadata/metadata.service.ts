import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DisasterType } from '../disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../disaster-type/disaster-type.service';
import { IndicatorDto } from './dto/indicator.dto';
import { LayerDto } from './dto/layer.dto';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Injectable()
export class MetadataService {
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(LayerMetadataEntity)
  private readonly layerRepository: Repository<LayerMetadataEntity>;

  public constructor(
    private readonly disasterTypeService: DisasterTypeService,
  ) {}

  public async getMainExposureIndicatorMetadata(
    disasterType: DisasterType,
  ): Promise<IndicatorMetadataEntity> {
    const mainExposureIndicator =
      await this.disasterTypeService.getMainExposureIndicator(disasterType);
    return await this.indicatorRepository.findOne({
      where: { name: mainExposureIndicator },
    });
  }

  public async upsertIndicators(
    indicators: IndicatorDto[],
  ): Promise<IndicatorMetadataEntity[]> {
    const indicatorsToSave = [];
    for await (const indicator of indicators) {
      let existingIndicator = await this.indicatorRepository.findOne({
        where: { name: indicator.name },
      });
      if (existingIndicator) {
        existingIndicator = await this.upsertIndicator(
          existingIndicator,
          indicator,
        );
        indicatorsToSave.push(existingIndicator);
        continue;
      }

      let newIndicator = new IndicatorMetadataEntity();
      newIndicator.name = indicator.name;
      newIndicator = await this.upsertIndicator(newIndicator, indicator);
      indicatorsToSave.push(newIndicator);
    }
    return await this.indicatorRepository.save(indicatorsToSave);
  }

  private async upsertIndicator(
    indicatorEntity: IndicatorMetadataEntity,
    indicator: IndicatorDto,
  ): Promise<IndicatorMetadataEntity> {
    indicatorEntity.countryDisasterTypes = JSON.parse(
      JSON.stringify(indicator.countryDisasterTypes || {}),
    );
    indicatorEntity.label = indicator.label;
    indicatorEntity.icon = indicator.icon;
    indicatorEntity.weightedAvg = indicator.weightedAvg;
    indicatorEntity.weightVar = indicator.weightVar;
    indicatorEntity.active = indicator.active;
    indicatorEntity.colorBreaks = JSON.parse(
      JSON.stringify(indicator.colorBreaks),
    );
    indicatorEntity.numberFormatMap = indicator.numberFormatMap;
    indicatorEntity.numberFormatAggregate = indicator.numberFormatAggregate;
    indicatorEntity.order = indicator.order;
    indicatorEntity.dynamic = indicator.dynamic;
    indicatorEntity.unit = indicator.unit;
    indicatorEntity.lazyLoad = indicator.lazyLoad;
    indicatorEntity.description = JSON.parse(
      JSON.stringify(indicator.description || {}),
    );

    return indicatorEntity;
  }

  public async upsertLayers(
    layers: LayerDto[],
  ): Promise<LayerMetadataEntity[]> {
    const layersToSave = [];
    for await (const layer of layers) {
      let existingLayer = await this.layerRepository.findOne({
        where: { name: layer.name },
      });
      if (existingLayer) {
        existingLayer = await this.upsertLayer(existingLayer, layer);
        layersToSave.push(existingLayer);
        continue;
      }

      let newLayer = new LayerMetadataEntity();
      newLayer.name = layer.name;
      newLayer = await this.upsertLayer(newLayer, layer);
      layersToSave.push(newLayer);
    }
    return await this.layerRepository.save(layersToSave);
  }

  private async upsertLayer(
    layerEntity: LayerMetadataEntity,
    layer: LayerDto,
  ): Promise<LayerMetadataEntity> {
    layerEntity.label = layer.label;
    layerEntity.type = layer.type;
    layerEntity.legendColor = layer.legendColor
      ? JSON.parse(JSON.stringify(layer.legendColor))
      : null;
    layerEntity.leadTimeDependent = layer.leadTimeDependent;
    layerEntity.active = layer.active;
    layerEntity.description = JSON.parse(
      JSON.stringify(layer.description || {}),
    );

    return layerEntity;
  }

  public async getIndicatorsByCountryAndDisaster(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<IndicatorMetadataEntity[]> {
    const indicators = await this.indicatorRepository.find();
    return indicators.filter(
      (metadata: IndicatorMetadataEntity): boolean =>
        metadata.countryDisasterTypes?.[countryCodeISO3]?.[disasterType] !==
        undefined,
    );
  }

  public async getLayersByCountryAndDisaster(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LayerMetadataEntity[]> {
    const layers = await this.layerRepository.find();

    return layers.filter(
      (metadata: LayerMetadataEntity): boolean =>
        metadata.description?.[countryCodeISO3]?.[disasterType] !== undefined ||
        metadata.type === 'shape', // this includes the 4 adminRegions layers
    );
  }
}
