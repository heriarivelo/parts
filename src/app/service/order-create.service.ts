import { Injectable } from '@angular/core';
import { ManagerService } from './manager.service';
import { Observable, switchMap } from 'rxjs';

@Injectable()
export class OrderCreateService {
  constructor(private managerService: ManagerService) {}

  // createOrderWithInvoice(orderData: any): Observable<any> {
  //   return this.managerService.createOrder(orderData).pipe(
  //     switchMap(orderResponse => {
  //       return this.managerService.createInvoice({
  //         orderId: orderResponse.id,
  //         totalAmount: orderData.totalAmount,
  //         paymentMethod: 'ESPECES'
  //       });
  //     })
  //   );
  // }

//  validateOrder(orderId: number, invoiceData: InvoiceData): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${orderId}/validate`, invoiceData);
//   }

}