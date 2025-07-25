import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private apiUrl = 'http://192.168.0.104:5000/api/orders-history';

  constructor(private http: HttpClient) { }

  moveOrder(bill_no: number){
    return this.http.post(this.apiUrl, {bill_no});
  }

  orderFilteredData(params: any){
    return this.http.post(this.apiUrl+'/filter', params);
  }
}
