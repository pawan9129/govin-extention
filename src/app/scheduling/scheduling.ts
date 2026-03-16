import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var chrome: any;
@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheduling.html',
  styleUrls: ['./scheduling.css'],
})

export class Scheduling implements OnInit {

  meetings: any[] = [];
  filteredMeetings: any[] = [];
  searchText: string = '';
  loading = false;
  error = '';

  TOKEN: string = '';

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTokenAndMeetings();
  }

  loadTokenAndMeetings() {

    chrome.storage.local.get("gov_access_token", (result: any) => {

      this.TOKEN = result.gov_access_token;

      console.log("TOKEN:", this.TOKEN);

      if (!this.TOKEN) {
        this.error = "User not logged in";
        return;
      }

      this.getScheduledMeetings();

    });

  }

  async getScheduledMeetings() {
    this.loading = true;
    this.error = '';
    const today = new Date();
    const startDateObj = new Date(today.getFullYear(), today.getMonth(), 1);
    function formatDate(date:any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const startDate = formatDate(startDateObj);
const endDate = formatDate(today);
    const payload = {
      ministryId: [5],
      // startDate: "2026-03-01",
      // endDate: "2026-03-31",
      startDate: startDate,
      endDate:endDate,
      meetingType: "4",
      tag_user: { userId: [38816] },
      roleArray: [
        {
          user_id: 38816,
          ministry_id: 5,
          is_tag: false,
          is_restricted: false
        }
      ]
    };

  try {
  const response = await fetch(
    "https://govintranet.gov.in/meityapis/calendar/meeting_list",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.TOKEN}`
      },
      body: JSON.stringify(payload)
    }
  );
  if (!response.ok) {
    throw new Error("API Error");
  }
  const result = await response.json();
  console.log("Meeting List:", result);
  let meetings = [];
  if (Array.isArray(result?.data)) {
    meetings = result.data;
  } 
  else if (Array.isArray(result?.data?.data)) {
    meetings = result.data.data;
  }
  this.meetings = meetings.sort(
    (a:any, b:any) => new Date(b.start).getTime() - new Date(a.start).getTime()
  );
  this.filteredMeetings = [...this.meetings];
    } catch (err) {
      console.error(err);
      this.error = "Failed to fetch meetings";
    }
    this.loading = false;
    this.cd.detectChanges();
  }
    filterMeetings() {
    const search = this.searchText.toLowerCase();
    this.filteredMeetings = this.meetings.filter(meeting =>
      meeting.host?.toLowerCase().includes(search) ||
      meeting.ministryShortName?.toLowerCase().includes(search) ||
      meeting.mode?.toLowerCase().includes(search)
    );
  }
  copyLink(link: string) {
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  }
  
}


// export class Scheduling implements OnInit {
//   meetings: any[] = [];
//   filteredMeetings: any[] = [];
//   searchText: string = '';
//   loading = false;
//   error = '';
//   constructor(private cd: ChangeDetectorRef) { }
//   TOKEN = '';
//   ngOnInit() {
//     this.getScheduledMeetings();
//   }

//   async getScheduledMeetings() {
    
//     this.loading = true;
//     this.error = '';
//     const payload = {
//       ministryId: [5],
//       startDate: "2026-03-01",
//       endDate: "2026-03-31",
//       meetingType: "4",
//       tag_user: { userId: [38816] },
//       roleArray: [
//         {
//           user_id: 38816,
//           ministry_id: 5,
//           is_tag: false,
//           is_restricted: false
//         }
//       ]
//     };
//     try {
      
//       const response = await fetch(
//         "https://govintranet.gov.in/meityapis/calendar/meeting_list", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${this.TOKEN}`
//         },
//         body: JSON.stringify(payload)
//       });
//       if (!response.ok) {
//         throw new Error("API Error");
//       }
//       const result = await response.json();
//       console.log("Meeting List:", result);
//       if (Array.isArray(result?.data)) {
//         this.meetings = result.data;
//       } else if (Array.isArray(result?.data?.data)) {
//         this.meetings = result.data.data;
//       } else {
//         this.meetings = [];
//       }
//       this.filteredMeetings = this.meetings;
//     } catch (err) {
//       console.error(err);
//       this.error = "Failed to fetch meetings";
//     }
//     this.loading = false;
//     this.cd.detectChanges();
//   }

  // filterMeetings() {
  //   const search = this.searchText.toLowerCase();
  //   this.filteredMeetings = this.meetings.filter(meeting =>
  //     meeting.host?.toLowerCase().includes(search) ||
  //     meeting.ministryShortName?.toLowerCase().includes(search) ||
  //     meeting.mode?.toLowerCase().includes(search)
  //   );
  // }
  // copyLink(link: string) {
  //   navigator.clipboard.writeText(link);
  //   alert("Link copied!");
  // }

// }