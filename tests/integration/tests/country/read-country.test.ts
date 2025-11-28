import { getToken } from '@helpers/utility.helper';

import { getCountries } from './country.api';

interface Country {
  countryCodeISO3: string;
}

export default function readCountryTests() {
  describe('create or update country and notification info', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    it('should return countries', async () => {
      const getCountriesResponse = await getCountries(token);

      expect(getCountriesResponse.status).toBe(200);
      expect(getCountriesResponse.body.length).toBeGreaterThan(0);
      expect(getCountriesResponse.body[0]).not.toHaveProperty(
        'notificationInfo',
      );
    });

    it('should return countries in alphabetical order', async () => {
      const getCountriesResponse = await getCountries(token);

      expect(getCountriesResponse.status).toBe(200);
      expect(getCountriesResponse.body.length).toBeGreaterThan(1);

      // countries must be alphabetically sorted by countryCodeISO3
      const countries = structuredClone(getCountriesResponse.body);
      const sortedCountries = structuredClone(countries).sort(
        (a: Country, b: Country) =>
          a.countryCodeISO3 > b.countryCodeISO3 ? 1 : -1,
      );
      expect(countries).toStrictEqual(sortedCountries);
    });

    it('should return specified countries', async () => {
      const countryCodesISO3 = ['KEN', 'MWI'];
      const getCountriesResponse = await getCountries(token, countryCodesISO3);

      expect(getCountriesResponse.status).toBe(200);
      expect(getCountriesResponse.body.length).toBe(countryCodesISO3.length);
      expect(getCountriesResponse.body[0]).not.toHaveProperty(
        'notificationInfo',
      );

      // countries must be alphabetically sorted by countryCodeISO3
      const countries = structuredClone(getCountriesResponse.body);
      const sortedCountries = structuredClone(countries).sort(
        (a: Country, b: Country) =>
          a.countryCodeISO3 > b.countryCodeISO3 ? 1 : -1,
      );
      expect(countries).toStrictEqual(sortedCountries);
    });

    it('should return country notification info', async () => {
      const countryCodesISO3 = ['KEN'];
      const minimalInfo = false;
      const getCountriesResponse = await getCountries(
        token,
        countryCodesISO3,
        minimalInfo,
      );

      expect(getCountriesResponse.status).toBe(200);
      expect(getCountriesResponse.body.length).toBe(countryCodesISO3.length);
      expect(getCountriesResponse.body[0]).toHaveProperty('notificationInfo');
    });
  });
}
