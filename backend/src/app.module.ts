import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { CategoriesModule } from './categories/categories.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { CalendarModule } from './calendar/calendar.module';
import { EmailModule } from './email/email.module';
import { User } from './users/user.entity';
import { Event } from './events/event.entity';
import { Ticket } from './tickets/ticket.entity';
import { Category } from './categories/category.entity';
import { Notification } from './notifications/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [User, Event, Ticket, Category, Notification],
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    TicketsModule,
    CategoriesModule,
    NotificationsModule,
    AdminModule,
    CalendarModule,
    EmailModule,
  ],
})
export class AppModule {}
