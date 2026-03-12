import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  constructor(private api: ApiService) {}

  getMeetings() {
    return this.api.get('meetings');
  }

  createMeeting(data: any) {
    return this.api.post('meetings', data);
  }
}