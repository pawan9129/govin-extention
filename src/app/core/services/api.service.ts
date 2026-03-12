import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // GET request
  get(path: string) {
    return this.http.get(`${AppSettings.apiUrl}/${path}`);
  }

  // POST request
  post(path: string, body: any) {
    return this.http.post(`${AppSettings.apiUrl}/${path}`, body);
  }
}