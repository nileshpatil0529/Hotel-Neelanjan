import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl + ':5000/api/users';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient, private router: Router) {}

  login(userName: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      user_name: userName,
      password,
    });
  }

  saveToken(userInfo: any): void {
    localStorage.setItem(this.tokenKey, userInfo.token);
    localStorage.setItem('userName', userInfo.userData.user_name);
    localStorage.setItem('userID', userInfo.userData.id);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  updatePassword(params: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, params);
  }
}
