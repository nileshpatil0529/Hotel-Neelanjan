import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.baseUrl + ':5000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  checkUsernameExists(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${username}`);
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addUser(user: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }
}
