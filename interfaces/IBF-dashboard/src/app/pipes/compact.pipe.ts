import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { NumberFormat } from '../types/indicator-group';

@Pipe({
  standalone: true,
  name: 'compact',
})
export class CompactPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  /*
   * 0 becomes 0
   * 2 becomes < 10
   * 12 becomes < 20
   * 20 becomes 20
   * 56 becomes 60
   * 297 becomes 300
   * 462 becomes 460
   * 1000 becomes 1K
   * 4200 becomes 4.2K
   * 225305 becomes 230K
   * 79136946 becomes 79M
   * negative numbers become 0
   */
  transform(value: number, format: NumberFormat = NumberFormat.decimal0) {
    if (value == null || isNaN(value)) {
      return '';
    }

    const style = format === NumberFormat.perc ? 'percent' : 'decimal';
    const maximumSignificantDigits =
      value > 100 || format === NumberFormat.perc ? 2 : 1;

    let min = 0;
    let prefix = '';

    if (format !== NumberFormat.perc) {
      // Add deviation for values between 0 and 20
      if (value > 0 && value < 20) {
        prefix = '< ';

        if (value > 10) {
          min = 20;
        } else if (value > 0) {
          min = 10;
        }
      }
    }

    value = value > 0 ? Math.max(value, min) : 0;

    return `${prefix}${new Intl.NumberFormat(this.locale, {
      maximumSignificantDigits,
      style,
      notation: 'compact',
    }).format(value)}`;
  }
}
