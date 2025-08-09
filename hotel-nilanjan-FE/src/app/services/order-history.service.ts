import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private apiUrl = environment.baseUrl + ':5000/api/orders-history';

  constructor(private http: HttpClient) { }

  moveOrder(bill_no: number){
    return this.http.post(this.apiUrl, {bill_no});
  }

  orderFilteredData(params: any){
    return this.http.post(this.apiUrl+'/filter', params);
  }
}
