import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://192.168.0.104:5000/api/orders';
  private socketUrl = 'http://192.168.0.104:5000'; // Socket.IO server URL
  private socket: Socket;

  constructor(private http: HttpClient) {
    // Initialize the Socket.IO connection
    this.socket = io(this.socketUrl, {
      transports: ['websocket', 'polling'], // Use compatible transports
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 5, // Retry 5 times before failing
    });
  }

  // Method to fetch orders via REST API
  fetchOrders(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Listen for the 'orderCreated' event
  onOrderCreated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('orderCreated', (data) => {
        observer.next(data);
      });
    });
  }

  createOrder(params: any) {
    return this.http.post(this.apiUrl, params);
  }

  printBill(bill_no: any, print_for: any) {
    return this.http.post(this.apiUrl+'/print-bill', {bill_no, print_for});
  }

  deleteItem(bill_no: any, total: any, product_name: any, count: any) {
    return this.http.post(this.apiUrl+'/remove-item', {bill_no, total, product_name, count});
  }

  deleteOrder(bill_no: any) {
    return this.http.post(this.apiUrl+'/delete-order', {bill_no});
  }

  getOrders(table_no: any) {
    let params = new HttpParams();
    
    if (table_no && table_no.trim() !== '') {
      params = params.set('table_no', table_no);
    }
    return this.http.get(this.apiUrl, { params });
  }

  getAllOrderItems(bill_no: any, check: any) {
    if(check === 'history') {
      return this.http.get(this.apiUrl + '-history/' + bill_no);
    } 
    return this.http.get(this.apiUrl + '/' + bill_no);
  }

  updatePayment(bill_no: any, payment: any) {
    return this.http.put(this.apiUrl, { bill_no, payment });
  }
  // update this payment from history
  updatePendingPayment(bill_no: any, payment: any) {
    return this.http.put(this.apiUrl+'/update-due', { bill_no, payment });
  }

  shiftTable(bill_no: any, shift_table: any) {
    return this.http.put(this.apiUrl + '/shift-table', { bill_no, shift_table });
  }

  mergeBills(bill_no: any, mergeBillarr: any) {
    return this.http.put(this.apiUrl + '/merge', {
      updatedBill_no: bill_no,
      mergeBills: mergeBillarr,
    });
  }

  updateDiscount(bill_no: any, discount: any) {
    return this.http.put(this.apiUrl + '/discount', { bill_no, discount });
  }
}
