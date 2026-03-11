import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './meeting.html',
  styleUrl: './meeting.css',
})
export class Meeting implements OnInit {

  meeting = {
    subject: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    meetingType: 'Other (In Person)',
    venue: '',
    priority: 'Medium',
    remarks: '',
    participant: '',
    share: true,
    customTime: false,
    allMdos: false
  };

  ngOnInit() {

    window.addEventListener('message', (event: any) => {
      if (event.data.type === 'EMAIL_DATA') {
        const data = event.data.data;
        console.log("Email Data Received", data);
        this.meeting.subject = data.subject;
        this.meeting.remarks = data.body;
        this.meeting.participant = data.senderEmail;
        this.parseDateTime(data.body);
      }
    });
  }

  parseDateTime(text: string) {

    const regex =
      /(\d{1,2}\s[A-Za-z]{3}\s\d{4}).*?(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)).*?(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm))/;

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

}