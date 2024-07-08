import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupByOrders'
})
export class GroupByOrdersPipe implements PipeTransform {

  // Method for pipe group by orders // 
  transform(collection: any[], property: string): any[] {
    if (!collection) {
      return null;
    }

    const groupedCollection = collection.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});

    return Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
  }

}
