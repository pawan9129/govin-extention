import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';
import { HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';



declare var chrome: any;

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting.html',
  styleUrl: './meeting.css',
})
export class Meeting implements OnInit {

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  meeting = {
    subject: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    meetingType: 'other',
    meetingPlatform: '',
    meetingLink: '',
    meetingPassword: '',
    venue: 'Google Meet',
    priority: 'Medium',
    remarks: '',
    // participant: '',
    participant: [] as number[],
    share: true,
    customTime: false,
    allMdos: false,

  };

  ngOnInit() {
    window.parent.postMessage({
      type: "ANGULAR_READY"
    }, "*");
    window.addEventListener('message', (event: any) => {
      if (event.data?.type === 'EMAIL_DATA') {
        const data = event?.data?.data;
        console.log("Email Data Received:", data);
        this.zone.run(() => {
          this.meeting.subject = this.extractCleanSubject(data?.subject);
          this.meeting.remarks = data?.body || '';
          this.meeting.participant = data?.senderEmail || '';
          this.parseDateTime(data?.body || '');
          this.cdr.detectChanges();
        });
      }
    });
     this.generateTimeSlots();

  if (this.timeSlots.length >= 2) {
    debugger
    this.meeting.startTime = this.timeSlots[0]; // 1st
    this.meeting.endTime = this.timeSlots[1];   // 2nd
  }
  }

  extractCleanSubject(subject: string): string {
    if (!subject) return '';
    let cleaned = subject;
    if (cleaned.includes(':')) {
      cleaned = cleaned.split(':').slice(1).join(':');
    }
    if (cleaned.includes('@')) {
      cleaned = cleaned.split('@')[0];
    }
    cleaned = cleaned.replace(/\(.*?\)/g, '');
    return cleaned.trim();
  }



  parseDateTime(text: string) {
    const regex = /(\d{1,2}\s[A-Za-z]{3}\s\d{4}).*?(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)).*?(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm))/;
    const match = text.match(regex);
    if (match) {
      const date = match[1]
      const startTime = match[2];
      const endTime = match[3];
      this.meeting.startDate = this.payloadformatDate(date)
      this.meeting.endDate = this.payloadformatDate(date);
      this.meeting.startTime = this.convertTo24Hour(startTime);
      this.meeting.endTime = this.convertTo24Hour(endTime);
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      const currentTime = `${hours}:${minutes}`;
      this.meeting.startDate = currentDate;
      this.meeting.endDate = currentDate;
      this.meeting.startTime = currentTime; 
      this.meeting.endTime = currentTime;
    }
  }

  convertTo24Hour(time: string) {
    const [timePart, modifier] = time.split(/(am|pm|AM|PM)/);
    let [hours, minutes] = timePart.trim().split(":");
    if (modifier.toLowerCase() === "pm" && hours !== "12") {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    if (modifier.toLowerCase() === "am" && hours === "12") {
      hours = "00";
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  payloadformatDate(date: any): string {
    console.log("date>>>>>>", date)
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getPriorityValue() {
    if (this.meeting.priority === "Top") return "1";
    if (this.meeting.priority === "Medium") return "2";
    return "3";
  }

  createMeeting() {
    chrome.storage.local.get("gov_access_token", (result: any) => {
      const formData = new FormData();
      formData.append("natureOfEng", "2");
      formData.append("frequencyId", "1");
      formData.append("bharatvc_moderator", "false");
      formData.append("bharatvc_record_video", "false");
      formData.append("category_id", "359");
      formData.append("baRule", "49");
      formData.append("subject", this.meeting.subject);
      formData.append("meetingStartDate", this.payloadformatDate(this.meeting.startDate));
      formData.append("meetingEndDate", this.payloadformatDate(this.meeting.endDate));
      formData.append("for_parent", "false");
      formData.append("color", "#80C380");
      formData.append("startTime", this.meeting.startTime + ":00");
      formData.append("endTime", this.meeting.endTime + ":00");
      formData.append("venueId", "null");
      formData.append("modeOfEng", "1");
      formData.append("meetingURL", "null");
      formData.append("isAllDay", "false");
      formData.append("is_private", this.meeting.share ? "false" : "true");
      formData.append("password", "");
      formData.append("priority", this.getPriorityValue());
      formData.append("proposal", this.meeting.remarks);
      formData.append("venue_text", this.meeting.venue);
      formData.append("is_draft", "false");
      formData.append("intParticipant", "[]");
      formData.append("extParticipant", "[]");
      const headers = new HttpHeaders({
        Authorization: `Bearer ${result?.gov_access_token}`,
        signature: "Cu5ELrRVts2f0cwWZETI9hCAQWuGOCGt1XEotrNTYKQ=",
        timestamp: Date.now().toString()
      });
      this.http.post(
        "https://govintranet.gov.in/meityapis/calendar/create_meeting",
        formData,
        { headers }
      ).subscribe({
        next: (res) => {
          console.log("Meeting Created", res);
          alert("Meeting created successfully");
        },
        error: (err) => {
          console.error("Error creating meeting", err);
        }
      });
    })
  }

  // searchTimer: any;
  // selectedParticipant: any = null;
  // participants: any[] = [];
  // selectParticipant(p: any) {
  //   console.log("Selected:", p);
  //   this.meeting.participant = p.name;
  //   this.selectedParticipant = p;
  //   this.participants = [];
  // }
  //   venues: any[] = [];
  // onMeetingTypeChange() {
  //   if (this.meeting.meetingType === 'virtual') {
  //     this.getVenues();
  //   } else {
  //     this.venues = [];
  //   }
  // }
  // searchParticipant() {
  //   clearTimeout(this.searchTimer);
  //   this.searchTimer = setTimeout(() => {
  //     if (!this.meeting.participant || this.meeting.participant.length < 2) {
  //       this.participants = [];
  //       return;
  //     }
  //     if (this.selectedParticipant && this.meeting.participant === this.selectedParticipant.name) {
  //       return;
  //     }
  //     chrome.storage.local.get("gov_access_token", (result: any) => {
  //       const body = {
  //         page: 1,
  //         size: 100,
  //         search: this.meeting.participant,
  //         level_wise: false,
  //         isGroup: true,
  //         inter: false
  //       };
  //       const headers = new HttpHeaders({
  //         Authorization: `Bearer ${result.gov_access_token}`,
  //         signature: "F/U+fSuiyjW6eVj9o76C9Jl/yhW98NsvVZPD8obAND4=",
  //         timestamp: Date.now().toString(),
  //         "Content-Type": "application/json"
  //       });
  //       this.http.post<any>(
  //         "https://govintranet.gov.in/meityapis/calendar/get_internal_assignee",
  //         body,
  //         { headers }
  //       ).subscribe(res => {
  //         console.log("API Response:", res);
  //         if (res?.data) {
  //           this.participants = res.data;
  //         }
  //       });
  //     });
  //   }, 300);
  // }
  // async getVenues() {
  //   chrome.storage.local.get("gov_access_token", (result: any) => {
  //     const token = result.gov_access_token;
  //     const timestamp = Date.now().toString();
  //     const signature = "s+BUfbOsPzNZuUum0UJzgPzk1iMrot7vHHQHsnSt2n8=";
  //     const headers = new HttpHeaders({
  //       'Authorization': `Bearer ${token}`,
  //       'signature': signature,
  //       'timestamp': timestamp
  //     });
  //     let params = new HttpParams()
  //       .set('filter[_and][0][ministry_id][_null]', 'true')
  //       .set('filter[_and][1][department_id][_null]', 'true')
  //       .set('filter[venue_name][_neq]', 'Webex-1')
  //       .set('filter[venue_type][_eq]', 'Virtual')
  //       .set('filter[venue_status][_eq]', 'published')
  //       .set('sort', 'venue_name');
  //     const url = `https://govintranet.gov.in/meityapis/items/tran_meeting_venue`;
  //     this.http.get<any>(url, { headers, params }).subscribe({
  //       next: (res) => {
  //         console.log("API Response:", res);
  //         this.venues = res?.data || [];
  //       },
  //       error: (err) => {
  //         console.error("API Error:", err);
  //       }
  //     });
  //   });
  // }
  
  //new
  searchTimer: any;
  selectedParticipants: any[] = [];
  searchText: string = '';
  participants: any[] = [];
  showDropdown: boolean = false;
  selectParticipant(p: any) {
    console.log("Selected:", p);
    const exists = this.selectedParticipants.find(x => x.id === p.id);
    if (exists) return;
    // this.selectedParticipants.push(p);
    this.selectedParticipants = [...this.selectedParticipants, p];
    this.searchText = '';
    this.participants = [];
    this.showDropdown = false;
    this.meeting.participant = this.selectedParticipants.map(x => x.id);
console.log("selectedParticipants>>>",this.selectedParticipants)
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: any) {
    const clickedInside = event.target.closest('.autocomplete-container');
    if (!clickedInside) {
      this.showDropdown = false;
    }
  }
  removeParticipant(p: any) {
    this.selectedParticipants =
      this.selectedParticipants.filter(x => x.id !== p.id);
  }

  onInputFocus() {
    this.showDropdown = true;
    if (!this.participants.length) {
      this.searchParticipant(true);
    }
  }
  openDropdown() {
    this.showDropdown = true;
    this.searchParticipant(true);
  }

  // ✅ debounce search
  // searchParticipant(p0: boolean) {

  //   clearTimeout(this.searchTimer);

  //   this.searchTimer = setTimeout(() => {

  //     if (!this.searchText || this.searchText.length < 1) {
  //       this.participants = [];
  //       return;
  //     }

  //     chrome.storage.local.get("gov_access_token", (result: any) => {

  //       const body = {
  //         page: 1,
  //         size: 100,
  //         search: this.searchText,
  //         level_wise: false,
  //         isGroup: true,
  //         inter: false
  //       };

  //       const headers = new HttpHeaders({
  //         Authorization: `Bearer ${result.gov_access_token}`,
  //         signature: "F/U+fSuiyjW6eVj9o76C9Jl/yhW98NsvVZPD8obAND4=",
  //         timestamp: Date.now().toString(),
  //         "Content-Type": "application/json"
  //       });

  //       this.http.post<any>(
  //         "https://govintranet.gov.in/meityapis/calendar/get_internal_assignee",
  //         body,
  //         { headers }
  //       ).subscribe(res => {

  //         console.log("API Response:", res);

  //         if (res?.data) {

  //           // ✅ already selected remove
  //           const selectedIds = this.selectedParticipants.map(x => x.id);

  //           this.participants = res.data.filter(
  //             (p: any) => !selectedIds.includes(p.id)
  //           );

  //           this.showDropdown = true;
  //         }

  //       });

  //     });

  //   }, 400);
  // }

  searchParticipant(force: boolean = false) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (!force && (!this.searchText || this.searchText.length < 1)) {
        this.participants = [];
        return;
      }
      chrome.storage.local.get("gov_access_token", (result: any) => {
        const body = {
          page: 1,
          size: 100,
          search: force ? "" : this.searchText,
          level_wise: false,
          isGroup: true,
          inter: false
        };
        const headers = new HttpHeaders({
          Authorization: `Bearer ${result.gov_access_token}`,
          signature: "F/U+fSuiyjW6eVj9o76C9Jl/yhW98NsvVZPD8obAND4=",
          timestamp: Date.now().toString(),
          "Content-Type": "application/json"
        });
        this.http.post<any>(
          "https://govintranet.gov.in/meityapis/calendar/get_internal_assignee",
          body,
          { headers }
        ).subscribe(res => {
          if (res?.data) {
            const selectedIds = this.selectedParticipants.map(x => x.id);
            this.participants = res.data.filter(
              (p: any) => !selectedIds.includes(p.id)
            );
            this.showDropdown = true;
          }
        });
      });
    }, 300);
  }

  venues: any[] = [];
  onMeetingTypeChange() {
    if (this.meeting.meetingType === 'virtual') {
      this.getVenues();
    } else {
      this.venues = [];
    }
  }

  getVenues() {
    chrome.storage.local.get("gov_access_token", (result: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${result.gov_access_token}`,
        signature: "s+BUfbOsPzNZuUum0UJzgPzk1iMrot7vHHQHsnSt2n8=",
        timestamp: Date.now().toString()
      });

      const params = new HttpParams()
        .set('filter[_and][0][ministry_id][_null]', 'true')
        .set('filter[_and][1][department_id][_null]', 'true')
        .set('filter[venue_name][_neq]', 'Webex-1')
        .set('filter[venue_type][_eq]', 'Virtual')
        .set('filter[venue_status][_eq]', 'published')
        .set('sort', 'venue_name');
      this.http.get<any>(
        "https://govintranet.gov.in/meityapis/items/tran_meeting_venue",
        { headers, params }
      ).subscribe({
        next: (res) => {
          console.log("Venues:", res);
          this.venues = res?.data || [];
        },
        error: (err) => {
          console.error("API Error:", err);
        }
      });
    });
  }

  onPlatformChange(event: any) {
    const selectedId = event.target.value;
    const selectedPlatform = this.venues.find(v => v.id == selectedId);
    if (!selectedPlatform) return;
    this.generateMeetingLink(selectedPlatform);
  }

  payloadformatTime(time: string): string {
    if (!time) return '';
    if (time.split(':').length === 3) return time;
    return `${time}:00`;
  }

  generateMeetingLink(platform: any) {
    chrome.storage.local.get("gov_access_token", (result: any) => {
      const token = result.gov_access_token;
      if (!token) {
        console.error("Token missing");
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'signature': 'x14eGrqLykxGDAyPNlPPoO3D4JANnWsJgBAiVIq2QHM=',
        'timestamp': Date.now().toString()
      });

      const body = {
        platformDetails: {
          platformId: Number(platform?.id || platform?.venue_id || 1),
          platformName: platform?.venue_name || platform?.name || "BharatVC"
        },
        platformSpecific: {},
        meetingSubject: this.meeting.subject || "Test Meeting",
        meetingFrequency: "1",
        meetingStartDate: this.payloadformatDate(this.meeting.startDate),
        meetingStartTime: this.payloadformatTime(this.meeting.startTime),
        meetingEndDate: this.payloadformatDate(this.meeting.endDate),
        meetingEndTime: this.payloadformatTime(this.meeting.endTime),
        timeZoneId: "Asia/Kolkata",
        isLobbyMode: false,
        autoStartRecord: false,
        meetingGuests: []
      };
      console.log("FINAL BODY:", body);
      this.http.post<any>('https://govintranet.gov.in/meityapis/calendar/generate-meeting-platform-link', body, { headers }).subscribe({
        next: (res) => {
          console.log("API SUCCESS:", res);
          const data = res?.data?.common || {};
          // this.meeting.meetingLink = data?.meetingUrl || '';
          // this.meeting.meetingPassword = data?.meetingPassword || '';
          this.zone.run(() => {
            this.meeting.meetingLink = data?.meetingUrl || '';
            this.meeting.meetingPassword = data?.meetingPassword || '';
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error("API ERROR FULL:", err);
        }
      });

    });
  }

  timeSlots: string[] = [];
  generateTimeSlots() {
    debugger
    this.timeSlots = [];
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    for (let i = 0; i < 24; i++) {
      let hours = now.getHours();
      let mins = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      let displayHour = hours % 12;
      if (displayHour === 0) displayHour = 12;
      const formatted =
        `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
      this.timeSlots.push(formatted);
      now.setMinutes(now.getMinutes() + 15);
    }
  }

  onCustomTimeChange() {
    if (!this.meeting.customTime) {
      this.generateTimeSlots();
      this.meeting.startTime = this.timeSlots[0];
      this.meeting.endTime = this.timeSlots[1];
    } else {
      this.meeting.startTime = this.convertTo24HourFormat(this.meeting.startTime);
      this.meeting.endTime = this.convertTo24HourFormat(this.meeting.endTime);
    }
  }

  convertTo24HourFormat(time: string) {
    if (!time) return '';
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  }

onStartTimeChange() {
  const index = this.timeSlots.indexOf(this.meeting.startTime);
  if (index !== -1 && this.timeSlots[index + 1]) {
    this.meeting.endTime = this.timeSlots[index + 1];
  }
}

  onEndTimeChange() {
    if (!this.meeting.customTime) {
      this.meeting.endTime =
        this.convertTo24HourFormat(this.meeting.endTime);
    }
  }
}