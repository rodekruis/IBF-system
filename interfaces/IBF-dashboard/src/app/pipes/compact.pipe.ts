import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { NumberFormat } from '../types/indicator-group';

@Pipe({
  standalone: true,
  name: 'compact',
})
export class CompactPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: number, format: NumberFormat = NumberFormat.decimal0) {
    const style = format === NumberFormat.perc ? 'percent' : 'decimal';
    const min = format === NumberFormat.perc ? 0.1 : 10;

    value = value > 0 ? Math.max(min, value) : 0;

    return new Intl.NumberFormat(this.locale, {
      maximumSignificantDigits: 1,
      style,
      notation: 'compact',
    }).format(value);
  }
}
