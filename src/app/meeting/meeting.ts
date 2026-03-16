import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var chrome: any;

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting.html',
  styleUrl: './meeting.css',
})
export class Meeting implements OnInit {

  constructor(private http: HttpClient, private zone: NgZone) { }

  meeting = {
    subject: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    meetingType: 'Other (In Person)',
    venue: 'Google Meet',
    priority: 'Medium',
    remarks: '',
    participant: '',
    share: true,
    customTime: false,
    allMdos: false
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
          this.meeting.subject = data?.subject || '';
          this.meeting.remarks = data?.body || '';
          this.meeting.participant = data?.senderEmail || '';
          this.parseDateTime(data?.body || '');
        });
      }
    });
  }

  // ngOnInit() {
  //   window.addEventListener('message', (event: any) => {
  //     if (event.data.type === 'EMAIL_DATA') {
  //       const data = event?.data?.data;
  //       console.log("Email Data Received", data);
  //       this.zone.run(() => {
  //         this.meeting.subject = data?.subject;
  //         this.meeting.remarks = data?.body;
  //         this.meeting.participant = data?.senderEmail;
  //         this.parseDateTime(data.body);
  //       });
  //     }
  //   });
  // }

  parseDateTime(text: string) {
    const regex = /(\d{1,2}\s[A-Za-z]{3}\s\d{4}).*?(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)).*?(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm))/;
    const match = text.match(regex);
    if (match) {
      const date = match[1];
      const startTime = match[2];
      const endTime = match[3];
      this.meeting.startDate = date;
      this.meeting.endDate = date;
      this.meeting.startTime = this.convertTo24Hour(startTime);
      this.meeting.endTime = this.convertTo24Hour(endTime);
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

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
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
      formData.append("meetingStartDate", this.formatDate(this.meeting.startDate));
      formData.append("meetingEndDate", this.formatDate(this.meeting.endDate));
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

  searchTimer: any;
  selectedParticipant: any = null;
  participants: any[] = [];
  selectParticipant(p: any) {
    console.log("Selected:", p);
    this.meeting.participant = p.name;
    this.selectedParticipant = p;
    this.participants = [];
  }

  searchParticipant() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (!this.meeting.participant || this.meeting.participant.length < 2) {
        this.participants = [];
        return;
      }
      if (this.selectedParticipant && this.meeting.participant === this.selectedParticipant.name) {
        return;
      }

      chrome.storage.local.get("gov_access_token", (result: any) => {
        const body = {
          page: 1,
          size: 100,
          search: this.meeting.participant,
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
          console.log("API Response:", res);
          if (res?.data) {
            this.participants = res.data;
          }
        });
      });
    }, 300);
  }

  // Next Fn();

}