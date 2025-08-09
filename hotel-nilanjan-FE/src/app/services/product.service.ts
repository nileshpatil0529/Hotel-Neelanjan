import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.baseUrl + ':5000/api/products';

  constructor(private http: HttpClient) {}

  createNupdateProduct(product: any, update: boolean): Observable<any> {
    const formData = new FormData();
    formData.append('product_name', product.product_name);
    formData.append('marathi', product.marathi);
    formData.append('product_price', product.product_price);
    formData.append('image', product.image  || null);
    
    if(update) {
      formData.append('product_id', product.product_id);
      return this.http.put(this.apiUrl, formData);
    } else {
      return this.http.post(this.apiUrl, formData);
    }
  }

  getAllProducts() {
    return this.http.get(this.apiUrl);
  }

  deleteProducts(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  changePassword(params: any){
    return this.http.put(environment.baseUrl + ':5000/api/users/password', { params });
  }

  // Language services
  getLang() {
    return this.http.get(this.apiUrl + '/get-lang');
  }
  
  changeLang(lang: any){
    return this.http.put(this.apiUrl + '/change-lang', lang);
  }
}
