import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CalendarService } from './calendar.service';
import { EventsService } from '../events/events.service';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(
    private calendarService: CalendarService,
    private eventsService: EventsService,
  ) {}

  @Get('events/:id/ics')
  async downloadICS(@Param('id') id: string, @Res() res: Response) {
    const event = await this.eventsService.findOne(id);
    const ics = this.calendarService.generateICS(event as any);

    res.set({
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="${event.title.replace(/\s+/g, '-')}.ics"`,
    });
    res.send(ics);
  }
}
