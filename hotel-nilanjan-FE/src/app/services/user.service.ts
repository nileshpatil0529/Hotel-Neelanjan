import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://192.168.0.104:5000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  checkUsernameExists(username: string): Observable<any> {
    return this.http.get<any>(`http://192.168.0.104:5000/api/users/${username}`);
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`http://192.168.0.104:5000/api/users/${id}`);
  }

  addUser(user: any) {
    return this.http.post<any>(`http://192.168.0.104:5000/api/users/register`, user);
  }
}
