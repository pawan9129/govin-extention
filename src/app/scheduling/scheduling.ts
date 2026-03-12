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
  TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mzg4MTYsImlzX21pbmlzdHJ5X2FkbWluIjp0cnVlLCJpc19kZXBhcnRtZW50X2FkbWluIjpmYWxzZSwiaXNfc3VwZXJfYWRtaW4iOmZhbHNlLCJyb2xlX2lkIjozNSwibWluaXN0cnlfaWQiOjUsImRlcGFydG1lbnRfaWQiOjk5LCJsZXZlbCI6MzUsImlzX3RhZ2dlZF9yb2xlIjpmYWxzZSwiaXNfdGFnX3Jpc3RyaWN0ZWQiOmZhbHNlLCJpc19kcmFmdCI6ZmFsc2UsImlzX2RyYWZ0X2FkbWluIjpmYWxzZSwidGFnZ2VkX2Zvcl9pZCI6bnVsbCwiZG9jX3Blcm1pdCI6ZmFsc2UsImlzQXBwbGljYXRpb24iOnRydWUsImlhdCI6MTc3MzI4NjY3OSwiZXhwIjoxNzczMzI5ODc5fQ.hnuMdeEqmUqsbeoyprJOwsQl183jmQFu8K6kARw5qgY';
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