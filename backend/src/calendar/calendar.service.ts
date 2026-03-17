import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarService {
  generateICS(event: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
  }): string {
    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub//EventHub//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(new Date(event.startDate))}`,
      `DTEND:${formatDate(new Date(event.endDate))}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n').slice(0, 200)}`,
      `LOCATION:${event.location}`,
      `UID:${Date.now()}@eventhub`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
