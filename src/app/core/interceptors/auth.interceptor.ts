import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  generateParichayUrl(): Observable<any> {
    return this.http.get(
      'https://govintranet.gov.in/meityapis/auth/parichay_login'
    );
  }
}