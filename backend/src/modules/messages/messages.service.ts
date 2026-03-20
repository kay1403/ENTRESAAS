import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(senderId: number, companyId: number, dto: CreateMessageDto) {
    // Créer le message
    const message = await this.prisma.message.create({
      data: {
        companyId,
        senderId,
        subject: dto.subject,
        content: dto.content,
        priority: dto.priority || 'INFO',
        isTeam: dto.isTeam || false,
        departmentId: dto.departmentId,
      },
    });

    // Ajouter les destinataires
    if (dto.recipientIds && dto.recipientIds.length > 0) {
      await this.prisma.messageRecipient.createMany({
        data: dto.recipientIds.map((userId) => ({
          messageId: message.id,
          userId,
        })),
      });
    } else if (dto.isTeam && dto.departmentId) {
      // Envoyer à tout un département
      const employees = await this.prisma.employeeInfo.findMany({
        where: { departmentId: dto.departmentId },
        select: { userId: true },
      });

      if (employees.length > 0) {
        await this.prisma.messageRecipient.createMany({
          data: employees.map((emp) => ({
            messageId: message.id,
            userId: emp.userId,
          })),
        });
      }
    }

    return this.findOne(message.id, companyId);
  }

  async findAll(companyId: number, userId: number) {
    // Messages reçus
    const received = await this.prisma.messageRecipient.findMany({
      where: { userId },
      include: {
        message: {
          include: {
            sender: { select: { id: true, email: true } },
          },
        },
      },
      orderBy: { message: { createdAt: 'desc' } },
    });

    // Messages envoyés
    const sent = await this.prisma.message.findMany({
      where: { senderId: userId, companyId },
      include: {
        sender: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      received: received.map((r) => ({
        ...r.message,
        isRead: r.isRead,
        readAt: r.readAt,
      })),
      sent,
    };
  }

  async findOne(id: number, companyId: number) {
    const message = await this.prisma.message.findFirst({
      where: { id, companyId },
      include: {
        sender: { select: { id: true, email: true } },
        recipients: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message non trouvé');
    }

    return message;
  }

  async markAsRead(id: number, userId: number) {
    const recipient = await this.prisma.messageRecipient.findFirst({
      where: {
        messageId: id,
        userId,
      },
    });

    if (!recipient) {
      throw new NotFoundException('Message non trouvé pour cet utilisateur');
    }

    return this.prisma.messageRecipient.update({
      where: {
        messageId_userId: {
          messageId: id,
          userId,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.messageRecipient.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }

  async deleteForUser(id: number, userId: number) {
    // Pour l'instant, on marque comme supprimé (soft delete à ajouter)
    return this.prisma.messageRecipient.updateMany({
      where: {
        messageId: id,
        userId,
      },
      data: {
        // On pourrait ajouter un champ deletedAt
      },
    });
  }
}
