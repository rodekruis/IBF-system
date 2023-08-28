import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterType } from '../disaster/disaster-type.enum';
import { AddIndicatorsDto, IndicatorDto } from './dto/add-indicators.dto';
import { AddLayersDto, LayerDto } from './dto/add-layers.dto';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Injectable()
export class MetadataService {
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(LayerMetadataEntity)
  private readonly layerRepository: Repository<LayerMetadataEntity>;

  public async addOrUpdateIndicators(
    indicators: AddIndicatorsDto,
  ): Promise<IndicatorMetadataEntity[]> {
    const indicatorsToSave = [];
    for await (const indicator of indicators.indicators) {
      let existingIndicator = await this.indicatorRepository.findOne({
        where: {
          name: indicator.name,
        },
      });
      if (existingIndicator) {
        existingIndicator = await this.addOrUpdateIndicator(
          existingIndicator,
          indicator,
        );
        indicatorsToSave.push(existingIndicator);
        continue;
      }

      let newIndicator = new IndicatorMetadataEntity();
      newIndicator.name = indicator.name;
      newIndicator = await this.addOrUpdateIndicator(newIndicator, indicator);
      indicatorsToSave.push(newIndicator);
    }
    return await this.indicatorRepository.save(indicatorsToSave);
  }

  private async addOrUpdateIndicator(
    indicatorEntity: IndicatorMetadataEntity,
    indicator: IndicatorDto,
  ): Promise<IndicatorMetadataEntity> {
    indicatorEntity.label = indicator.label;
    indicatorEntity.icon = indicator.icon;
    indicatorEntity.weightedAvg = indicator.weightedAvg;
    indicatorEntity.weightVar = indicator.weightVar;
    indicatorEntity.active = indicator.active;
    indicatorEntity.colorBreaks = JSON.parse(
      JSON.stringify(indicator.colorBreaks),
    );
    indicatorEntity.numberFormatMap = indicator.numberFormatMap;
    indicatorEntity.aggregateIndicator = indicator.aggregateIndicator;
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

  public async addOrUpdateLayers(
    layers: AddLayersDto,
  ): Promise<LayerMetadataEntity[]> {
    const layersToSave = [];
    for await (const layer of layers.layers) {
      let existingLayer = await this.layerRepository.findOne({
        where: {
          name: layer.name,
        },
      });
      if (existingLayer) {
        existingLayer = await this.addOrUpdateLayer(existingLayer, layer);
        layersToSave.push(existingLayer);
        continue;
      }

      let newLayer = new LayerMetadataEntity();
      newLayer.name = layer.name;
      newLayer = await this.addOrUpdateLayer(newLayer, layer);
      layersToSave.push(newLayer);
    }
    return await this.layerRepository.save(layersToSave);
  }

  private async addOrUpdateLayer(
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
        metadata.description?.[countryCodeISO3] &&
        metadata.description?.[countryCodeISO3][disasterType],
    );
  }

  public async getLayersByCountryAndDisaster(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LayerMetadataEntity[]> {
    const layers = await this.layerRepository.find();

    return layers.filter(
      (metadata: LayerMetadataEntity): boolean =>
        metadata.description?.[countryCodeISO3] &&
        metadata.description?.[countryCodeISO3][disasterType],
    );
  }
}
