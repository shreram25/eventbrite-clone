import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventStatus } from '../common/enums/event-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
  ) {}

  async findAll(query: QueryEventsDto) {
    const { search, categoryId, status, startDate, isFree, page = 1, limit = 12 } = query;

    const qb = this.eventsRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.category', 'category');

    // Public users only see approved events
    if (!status) {
      qb.andWhere('event.status = :status', { status: EventStatus.APPROVED });
    } else {
      qb.andWhere('event.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(event.title) LIKE :search OR LOWER(event.description) LIKE :search OR LOWER(event.location) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('event.categoryId = :categoryId', { categoryId });
    }

    if (startDate) {
      qb.andWhere('event.startDate >= :startDate', { startDate: new Date(startDate) });
    }

    if (isFree === 'true') {
      qb.andWhere('event.isFree = true');
    } else if (isFree === 'false') {
      qb.andWhere('event.isFree = false');
    }

    qb.orderBy('event.startDate', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [events, total] = await qb.getManyAndCount();

    return {
      data: events.map((e) => ({ ...e, organizer: { id: e.organizer?.id, name: e.organizer?.name } })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const event = await this.eventsRepo.findOne({ where: { id }, relations: ['organizer', 'category', 'tickets'] });
    if (!event) throw new NotFoundException('Event not found');
    const registeredCount = event.tickets?.filter((t) => t.status === 'registered').length || 0;
    return { ...event, registeredCount, spotsLeft: event.capacity - registeredCount, organizer: { id: event.organizer?.id, name: event.organizer?.name, email: event.organizer?.email } };
  }

  async create(dto: CreateEventDto, organizerId: string) {
    const event = this.eventsRepo.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      organizerId,
      status: EventStatus.PENDING,
    });
    return this.eventsRepo.save(event);
  }

  async update(id: string, dto: Partial<CreateEventDto>, user: any) {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized');
    }
    Object.assign(event, dto);
    if (dto.startDate) event.startDate = new Date(dto.startDate);
    if (dto.endDate) event.endDate = new Date(dto.endDate);
    return this.eventsRepo.save(event);
  }

  async remove(id: string, user: any) {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized');
    }
    await this.eventsRepo.remove(event);
    return { message: 'Event deleted' };
  }

  async findByOrganizer(organizerId: string) {
    return this.eventsRepo.find({
      where: { organizerId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAttendeesForEvent(eventId: string, organizerId: string) {
    const event = await this.eventsRepo.findOne({ where: { id: eventId }, relations: ['tickets', 'tickets.user'] });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId) throw new ForbiddenException('Not authorized');
    return event.tickets;
  }
}
