import translations from 'src/assets/i18n/en.json';

export class MockTranslateService {
  instant(key: string): string {
    const nestedKeys = key.split('.');
    let value = translations;
    for (const nestedKey of nestedKeys) {
      value = value[nestedKey];
    }
    if (typeof value === 'string') {
      return value;
    } else {
      return key;
    }
  }
}
