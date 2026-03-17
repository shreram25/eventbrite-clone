import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, TicketStatus, PaymentStatus } from './ticket.entity';
import { Event } from '../events/event.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { EventStatus } from '../common/enums/event-status.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
  ) {}

  async register(dto: CreateTicketDto, userId: string) {
    const event = await this.eventsRepo.findOne({
      where: { id: dto.eventId },
      relations: ['tickets'],
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== EventStatus.APPROVED) {
      throw new BadRequestException('Event is not available for registration');
    }

    // Check if already registered
    const existing = await this.ticketsRepo.findOne({
      where: { userId, eventId: dto.eventId, status: TicketStatus.REGISTERED },
    });
    if (existing) throw new ConflictException('Already registered for this event');

    // Check capacity
    const registered = await this.ticketsRepo.count({
      where: { eventId: dto.eventId, status: TicketStatus.REGISTERED },
    });
    if (registered >= event.capacity) {
      throw new BadRequestException('Event is at full capacity');
    }

    const ticket = this.ticketsRepo.create({
      userId,
      eventId: dto.eventId,
      ticketCode: `TKT-${uuidv4().slice(0, 8).toUpperCase()}`,
      status: TicketStatus.REGISTERED,
      paymentStatus: event.isFree ? PaymentStatus.COMPLETED : PaymentStatus.MOCK,
    });

    return this.ticketsRepo.save(ticket);
  }

  async cancel(ticketId: string, userId: string) {
    const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.userId !== userId) throw new BadRequestException('Not your ticket');

    ticket.status = TicketStatus.CANCELLED;
    return this.ticketsRepo.save(ticket);
  }

  async findMyTickets(userId: string) {
    return this.ticketsRepo.find({
      where: { userId },
      relations: ['event', 'event.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEvent(eventId: string) {
    return this.ticketsRepo.find({
      where: { eventId },
      relations: ['user'],
    });
  }
}
