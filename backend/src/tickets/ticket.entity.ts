import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';

export enum TicketStatus {
  REGISTERED = 'registered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  MOCK = 'mock',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Event, (event) => event.tickets, { eager: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.REGISTERED })
  status: TicketStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.MOCK })
  paymentStatus: PaymentStatus;

  @Column({ unique: true })
  ticketCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
