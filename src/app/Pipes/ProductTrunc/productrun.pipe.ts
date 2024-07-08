import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productrun'
})
export class ProductrunPipe implements PipeTransform {

  // Method for pipe product // 
  
  transform(value: string, limit: number = 120, completeWords: boolean = false): string {
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return value.length > limit ? value.substr(0, limit) + '..' : value;
  }
}
