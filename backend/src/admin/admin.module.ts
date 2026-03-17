import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Ticket]), NotificationsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
