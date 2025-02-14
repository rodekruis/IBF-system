/* eslint-disable @typescript-eslint/no-explicit-any */
// import { beforeEach, describe, it } from 'node:test';

import { getRepositoryToken } from '@nestjs/typeorm';

import { TestBed } from '@automock/jest';
import { Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { TyphoonCategory } from './dto/trackpoint-details';
import { TyphoonTrackEntity } from './typhoon-track.entity';
import { TyphoonTrackService } from './typhoon-track.service';

const countryCodeISO3 = 'PHL';
const eventName = 'Mock typhoon 1';

const timestamp = new Date();
const date = timestamp.toISOString();
const mockLastUploadDate = { date, timestamp };

const mockTyphoonTrack: TyphoonTrackEntity[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    countryCodeISO3,
    leadTime: LeadTime.hour72,
    date: timestamp,
    timestamp,
    timestampOfTrackpoint: timestamp,
    windspeed: 120,
    category: TyphoonCategory.STS,
    firstLandfall: true,
    closestToLand: false,
    eventName,
    geom: JSON.parse(JSON.stringify({})),
  },
];

describe('TyphoonTrackService', () => {
  let typhoonTrackService: TyphoonTrackService;
  let helperService: HelperService;
  let typhoonTrackRepository: Repository<TyphoonTrackEntity>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(TyphoonTrackService).compile();

    typhoonTrackService = unit;
    helperService = unitRef.get(HelperService);
    typhoonTrackRepository = unitRef.get(
      getRepositoryToken(TyphoonTrackEntity) as any,
    );

    jest
      .spyOn(helperService, 'getLastUploadDate')
      .mockResolvedValue(mockLastUploadDate);

    jest
      .spyOn(typhoonTrackRepository, 'find')
      .mockResolvedValue(mockTyphoonTrack);
  });

  it('should be defined', () => {
    expect(typhoonTrackService).toBeDefined();
    expect(typhoonTrackRepository).toBeDefined();
  });

  describe('getTyphoonSpecificProperties', () => {
    it('should yield typhoonLandfall=true if track contains point with firstLandfall=true', async () => {
      // Arrange
      mockTyphoonTrack[0].firstLandfall = true;

      // Act
      const result = await typhoonTrackService.getTyphoonSpecificProperties(
        countryCodeISO3,
        eventName,
      );

      // Assert
      expect(result.typhoonLandfall).toBe(true);
      expect(result.typhoonNoLandfallYet).toBe(false);
    });

    it('should yield typhoonLandfall=false for scenario NoLandfall', async () => {
      // Arrange
      mockTyphoonTrack[0].firstLandfall = false;

      // Act
      const result = await typhoonTrackService.getTyphoonSpecificProperties(
        countryCodeISO3,
        eventName,
      );

      // Assert
      expect(result.typhoonLandfall).toBe(false);
      expect(result.typhoonNoLandfallYet).toBe(false);
    });

    it('should yield typhoonNoLandfallYet=true for scenario NoLandfallYet', async () => {
      // Arrange
      mockTyphoonTrack[0].firstLandfall = false;
      mockTyphoonTrack.push(mockTyphoonTrack[0]); // Add a 2nd trackpoint, also no landfall
      mockTyphoonTrack[1].timestampOfTrackpoint = new Date(
        timestamp.getTime() + 3 * 60 * 60 * 1000,
      ); // Add 3 hours, making this the "last" point in the track
      mockTyphoonTrack[1].closestToLand = true; // Set last point to be closest to land

      // Act
      const result = await typhoonTrackService.getTyphoonSpecificProperties(
        countryCodeISO3,
        eventName,
      );

      // Assert
      expect(result.typhoonLandfall).toBe(false);
      expect(result.typhoonNoLandfallYet).toBe(true);
    });
  });
});
