import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../api/user/user.entity';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { CountryEntity } from '../api/country/country.entity';
import { AreaOfFocusEntity } from '../api/eap-actions/area-of-focus.entity';
import { IndicatorEntity } from '../api/indicator/indicator.entity';
import { CountryStatus } from '../api/country/country-status.enum';
import { UserRole } from '../api/user/user-role.enum';
import { UserStatus } from '../api/user/user-status.enum';
import areasOfFocus from './areas-of-focus.json';
import eapActions from './EAP-actions.json';
import indicators from './indicator-metadata.json';
import { AdminLevel } from '../api/country/admin-level.enum';
import { ForecastEntity } from '../api/forecast/forecast.entity';
import { ForecastStatus } from '../api/forecast/forecast-status.enum';

const forecasts = [
  {
    forecastName: '1-day',
    forecastLabel: '1-day',
    forecastStatus: ForecastStatus.Inactive,
  },
  {
    forecastName: '2-day',
    forecastLabel: '2-day',
    forecastStatus: ForecastStatus.Inactive,
  },
  {
    forecastName: '3-day',
    forecastLabel: '3-day',
    forecastStatus: ForecastStatus.Active,
  },
  {
    forecastName: '4-day',
    forecastLabel: '4-day',
    forecastStatus: ForecastStatus.Inactive,
  },
  {
    forecastName: '5-day',
    forecastLabel: '5-day',
    forecastStatus: ForecastStatus.Inactive,
  },
  {
    forecastName: '6-day',
    forecastLabel: '6-day',
    forecastStatus: ForecastStatus.Inactive,
  },
  {
    forecastName: '7-day',
    forecastLabel: '7-day',
    forecastStatus: ForecastStatus.Active,
  },
];

const users = [
  {
    email: 'dunant@redcross.nl',
    username: 'dunant',
    firstName: 'Henry',
    lastName: 'Dunant',
    userRole: UserRole.Admin,
    password: 'password',
    userStatus: UserStatus.Active,
    countries: ['UGA', 'ZMB', 'KEN', 'ETH'],
  },
  {
    email: 'uganda@redcross.nl',
    username: 'uganda',
    firstName: 'Uganda',
    lastName: 'Manager',
    userRole: UserRole.DisasterManager,
    password: 'password',
    userStatus: UserStatus.Active,
    countries: ['UGA'],
  },
  {
    email: 'zambia@redcross.nl',
    username: 'zambia',
    firstName: 'Zambia',
    lastName: 'Manager',
    userRole: UserRole.DisasterManager,
    password: 'password',
    userStatus: UserStatus.Active,
    countries: ['ZMB'],
  },
  {
    email: 'kenya@redcross.nl',
    username: 'kenya',
    firstName: 'Kenya',
    lastName: 'Manager',
    userRole: UserRole.DisasterManager,
    password: 'password',
    userStatus: UserStatus.Active,
    countries: ['KEN'],
  },
  {
    email: 'ethiopia@redcross.nl',
    username: 'ethiopia',
    firstName: 'Ethiopia',
    lastName: 'Manager',
    userRole: UserRole.DisasterManager,
    password: 'password',
    userStatus: UserStatus.Active,
    countries: ['ETH'],
  },
];

const countries = [
  {
    countryCode: 'UGA',
    countryName: 'Uganda',
    countryStatus: CountryStatus.Active,
    defaultAdminLevel: AdminLevel.adm2,
    countryForecasts: ['7-day'],
    adminRegionLabels: ['Regions', 'Districts', 'Counties', 'Parishes'],
    eapLink:
      'https://docs.google.com/document/d/1IiG2ZFasCVE7kmYfqgyrx7SuZWkoYzTvw3LaEt2nl2U/edit#heading=h.35nkun2',
  },
  {
    countryCode: 'ZMB',
    countryName: 'Zambia',
    countryStatus: CountryStatus.Active,
    defaultAdminLevel: AdminLevel.adm2,
    countryForecasts: ['3-day', '7-day'],
    adminRegionLabels: ['Provinces', 'Districts', 'Wards'],
    eapLink:
      'https://docs.google.com/document/d/18SG6UklAYsY5EkVAINnZUH6D_tvry3Jh479mpVTehRU/edit?ts=5da1dba5#bookmark=id.xa68na3bshzr',
  },
  {
    countryCode: 'KEN',
    countryName: 'Kenya',
    countryStatus: CountryStatus.Active,
    defaultAdminLevel: AdminLevel.adm1,
    countryForecasts: ['7-day'],
    adminRegionLabels: ['Counties', 'Subcounties', 'Wards'],
    eapLink:
      'https://docs.google.com/document/d/1nEfCDx0aV0yBebIjeGHalXMAVUNM8XgR/edit#bookmark=id.jtmxnnw2k1z9',
  },
  {
    countryCode: 'ETH',
    countryName: 'Ethiopia',
    countryStatus: CountryStatus.Active,
    defaultAdminLevel: AdminLevel.adm2,
    countryForecasts: ['7-day'],
    adminRegionLabels: ['Regions', 'Zones', 'Woredas'],
    eapLink:
      'https://docs.google.com/document/d/1IQy_1pWvoT50o0ykjJTUclVrAedlHnkwj6QC7gXvk98/edit#bookmark=id.ysn0drq0f4nx',
  },
];

@Injectable()
export class SeedInit implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    await this.connection.dropDatabase();
    await this.connection.synchronize(true);

    // ***** CREATE FORECASTS *****

    const forecastRepository = this.connection.getRepository(ForecastEntity);
    const forecastEntities = forecasts.map(
      (forecast): ForecastEntity => {
        let forecastEntity = new ForecastEntity();
        forecastEntity.forecastName = forecast.forecastName;
        forecastEntity.forecastLabel = forecast.forecastLabel;
        forecastEntity.forecastStatus = forecast.forecastStatus;
        return forecastEntity;
      },
    );

    await forecastRepository.save(forecastEntities);

    // ***** CREATE COUNTRIES *****

    const countryRepository = this.connection.getRepository(CountryEntity);
    const countryEntities = await Promise.all(
      countries.map(
        async (country): Promise<CountryEntity> => {
          let countryEntity = new CountryEntity();
          countryEntity.countryCode = country.countryCode;
          countryEntity.countryName = country.countryName;
          countryEntity.countryStatus = country.countryStatus;
          countryEntity.countryForecasts = await forecastRepository.find({
            where: country.countryForecasts.map(
              (countryForecast: string): object => {
                return { name: countryForecast };
              },
            ),
          });
          return countryEntity;
        },
      ),
    );

    await countryRepository.save(countryEntities);

    // ***** CREATE ADMIN USER *****

    const userRepository = this.connection.getRepository(UserEntity);
    const userEntities = await Promise.all(
      users.map(
        async (user): Promise<UserEntity> => {
          let userEntity = new UserEntity();
          userEntity.email = user.email;
          userEntity.username = user.username;
          userEntity.firstName = user.firstName;
          userEntity.lastName = user.lastName;
          userEntity.userRole = user.userRole;
          userEntity.countries = await countryRepository.find({
            where: user.countries.map((countryCode: string): object => {
              return { countryCode: countryCode };
            }),
          });
          userEntity.userStatus = user.userStatus;
          userEntity.password = user.password;
          return userEntity;
        },
      ),
    );

    await userRepository.save(userEntities);

    // ***** CREATE AREAS OF FOCUS *****

    const areaOfFocusRepository = this.connection.getRepository(
      AreaOfFocusEntity,
    );
    await areaOfFocusRepository.save(areasOfFocus);

    // ***** CREATE EAP ACTIONS *****
    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save(eapActions);

    // ***** CREATE INDICATORS *****
    const indicatorRepository = this.connection.getRepository(IndicatorEntity);
    await indicatorRepository.save(indicators);
  }
}

export default SeedInit;
