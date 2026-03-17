import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
  ) {}

  async create(userId: string, message: string, type?: string) {
    const notification = this.notificationsRepo.create({ userId, message, type });
    return this.notificationsRepo.save(notification);
  }

  findByUser(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(id: string, userId: string) {
    await this.notificationsRepo.update({ id, userId }, { isRead: true });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.notificationsRepo.update({ userId }, { isRead: true });
    return { message: 'All marked as read' };
  }
}
