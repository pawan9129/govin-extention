import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  constructor(private cd: ChangeDetectorRef) { }
  TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19zdXBlcl9hZG1pbiI6ZmFsc2UsImlzX21pbmlzdGVyIjpmYWxzZSwiaXNfbWluaXN0cnlfYWRtaW4iOmZhbHNlLCJpc19kZXBhcnRtZW50X2FkbWluIjpmYWxzZSwiaWQiOjM4ODE2LCJyb2xlX2lkIjozNSwibWluaXN0cnlfaWQiOjExMywiZGVwYXJ0bWVudF9pZCI6NTM5LCJsZXZlbCI6MzUsImlzX3RhZ2dlZF9yb2xlIjpmYWxzZSwidGFnZ2VkX2Zvcl9pZCI6bnVsbCwiaXNfdGFnX3Jpc3RyaWN0ZWQiOmZhbHNlLCJpc19kcmFmdCI6ZmFsc2UsImlzX2RyYWZ0X2FkbWluIjpmYWxzZSwiaXNBcHBsaWNhdGlvbiI6dHJ1ZSwiaWF0IjoxNzczMjEzNzQ4LCJleHAiOjE3NzMyNTY5NDh9.r0wETIe4NU7IjCM1fdbPWPHDtN82eGONoPS5YCPycXc';
  ngOnInit() {
    this.getScheduledMeetings();
  }
  async getScheduledMeetings() {
    this.loading = true;
    this.error = '';
    const payload = {
      ministryId: [5],
      startDate: "2026-03-01",
      endDate: "2026-03-31",
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
        "https://govintranet.gov.in/meityapis/calendar/meeting_list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.TOKEN}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("API Error");
      }
      const result = await response.json();
      console.log("Meeting List:", result);
      if (Array.isArray(result?.data)) {
        this.meetings = result.data;
      } else if (Array.isArray(result?.data?.data)) {
        this.meetings = result.data.data;
      } else {
        this.meetings = [];
      }
      this.filteredMeetings = this.meetings;
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