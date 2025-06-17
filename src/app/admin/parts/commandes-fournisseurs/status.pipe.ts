import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusFr' })
export class StatusFrPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'SHIPPED':
        return 'Expédié';
      case 'DELIVERED':
        return 'Livré';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  }
}
