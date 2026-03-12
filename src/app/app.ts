import { Component, signal, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // ← MUST
import { Meeting } from './meeting/meeting';
import { Scheduling } from './scheduling/scheduling';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/environment ';
import { AuthService } from './core/interceptors/auth.interceptor';

// import { Contact } from './contact/contact';
// import { Meetingcreate } from './meetingcreate/meetingcreate';
declare var chrome: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, Meeting, Scheduling]
  // imports: [Footer, Meeting, Scheduling, Contact, Meetingcreate]
})

export class App implements OnInit {
  protected readonly title = signal('govin-extention');
  isLoggedIn = false;
  // constructor(private http: HttpClient) { }
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef // ← Important
  ) {}
  ngOnInit() {
    this.checkLogin();
    this.getToken();
  }

  getToken() {
  chrome.storage.local.get("gov_access_token", (result:any) => {
    console.log("TOKEN =", result.gov_access_token);
    console.log("TOKEN >>>>>>>>>=", result);
  });
}
  // checkLogin() {
  //   this.isLoggedIn = localStorage.getItem('loginWithParichay') === 'true';
  // }
  checkLogin() {
    chrome.storage.local.get(['parichayToken'], (result: any) => {
      if (result.parichayToken) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
      this.cdr.detectChanges(); 
    });
  }
    loginWithParichay() {
    try {
      debugger
      this.authService.generateParichayUrl().subscribe({
        next: (res: any) => {
          if (res?.data) {
            const url = `https://parichay.nic.in/pnv1/assets/login?sid=${environment.loginWithParichay.serviceName}`;
            // Open login in new tab
            window.open(url, '_blank');
          }
        },
        error: (err: any) => {
          console.error('Parichay Login Error:', err);
        },
      });
    } catch (err) {
      console.error('Unexpected error in loginWithParichay =>', err);
    }
  }


  // loginWithParichay() {
  //   localStorage.setItem('loginWithParichay', 'true');
  //   localStorage.removeItem('loginWithJanParichay');
  //   try {
  //      this.authService.generateParichayUrl().subscribe({
  //     next: (res: any) => {
  //       debugger
  //       console.log("Respo>>>>",res)
  //       if (res?.data) {
  //         const url = `https://parichay.nic.in/pnv1/api/login?service=${environment.loginWithParichay.serviceName}&tid=${res?.data?.tsp}&cs=${res?.data?.hmacres?.data?.signature}&string=${res?.data?.encValue}`;

  //         window.open(url, '_blank');
  //       }
  //     },
  //     error: (err :any) => {
  //       console.error('Parichay Login Error:', err);
  //     }
  //   });

  //   } catch (err) {
  //     console.error('Unexpected error in loginWithParichay =>', err);
  //   }
  // }

  logout() {
    localStorage.removeItem('loginWithParichay');
    localStorage.removeItem('loginWithJanParichay');
    this.isLoggedIn = false;
    window.location.reload();
  }
}