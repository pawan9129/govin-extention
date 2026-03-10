import { Component, signal } from '@angular/core';
// import { Footer } from './footer/footer';
import { Meeting } from './meeting/meeting';
import { Scheduling } from './scheduling/scheduling';
// import { Contact } from './contact/contact';
// import { Meetingcreate } from './meetingcreate/meetingcreate';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [Meeting, Scheduling]
  // imports: [Footer, Meeting, Scheduling, Contact, Meetingcreate]
})

export class App {
  protected readonly title = signal('govin-extention');
}
