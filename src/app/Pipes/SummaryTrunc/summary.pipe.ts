import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'summary'
})
export class SummaryPipe implements PipeTransform {
  
  // Method for pipe summary // 
  
  transform(value: string, maxLength: number = 120): string {
    if (!value) {
      return '';
    }
    if (value.length <= maxLength) {
      return value;
    } else {
      return value.substring(0, maxLength) + '..';
    }
  }
}
