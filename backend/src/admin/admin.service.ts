import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';
import { EventStatus } from '../common/enums/event-status.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
    private notificationsService: NotificationsService,
  ) {}

  async getPendingEvents() {
    return this.eventsRepo.find({
      where: { status: EventStatus.PENDING },
      relations: ['organizer', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllEvents() {
    return this.eventsRepo.find({
      relations: ['organizer', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveEvent(id: string) {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    event.status = EventStatus.APPROVED;
    await this.eventsRepo.save(event);
    await this.notificationsService.create(
      event.organizerId,
      `Your event "${event.title}" has been approved!`,
      'event_approved',
    );
    return event;
  }

  async rejectEvent(id: string, reason: string) {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    event.status = EventStatus.REJECTED;
    event.rejectionReason = reason;
    await this.eventsRepo.save(event);
    await this.notificationsService.create(
      event.organizerId,
      `Your event "${event.title}" was rejected. Reason: ${reason}`,
      'event_rejected',
    );
    return event;
  }

  async getStats() {
    const [totalUsers, totalEvents, totalTickets, pendingEvents] = await Promise.all([
      this.usersRepo.count(),
      this.eventsRepo.count(),
      this.ticketsRepo.count(),
      this.eventsRepo.count({ where: { status: EventStatus.PENDING } }),
    ]);
    return { totalUsers, totalEvents, totalTickets, pendingEvents };
  }

  async getAllUsers() {
    return this.usersRepo.find({
      select: ['id', 'email', 'name', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }
}
