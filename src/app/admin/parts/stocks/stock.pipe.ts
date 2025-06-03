// stock.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class StockFilterPipe implements PipeTransform {
  transform(items: any[], field: string, value: any): any[] {
    if (!items) return [];
    if (!value || value === '') return items;

    // Gestion des tableaux (pour les relations)
    if (Array.isArray(items[0][field])) {
      return items.filter(item => 
        item[field].some((el: any) => el === value)
      );
    }

    // Gestion standard
    return items.filter(item => item[field] === value);
  }
}