import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationPriority } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async getMyNotifications(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return { count };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async create(data: { 
    userId: number; 
    companyId?: number; 
    type: string; 
    title: string; 
    message: string; 
    priority?: NotificationPriority;
    link?: string;
    data?: any;
  }) {
    // Si companyId n'est pas fourni, le récupérer depuis l'utilisateur
    let companyId = data.companyId;
    
    if (!companyId) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { companyId: true },
      });
      
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      
      companyId = user.companyId;
    }

    return this.prisma.notification.create({
      data: {
        companyId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'INFO',
        link: data.link,
        data: data.data || null,
      },
    });
  }

  async createForMultipleUsers(data: {
    userIds: number[];
    companyId: number;
    type: string;
    title: string;
    message: string;
    priority?: NotificationPriority;
    link?: string;
  }) {
    const notifications = data.userIds.map(userId => ({
      companyId: data.companyId,
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'INFO',
      link: data.link,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }
}
