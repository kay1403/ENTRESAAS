import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    // Récupérer l'utilisateur pour avoir companyId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Créer la tâche
    const task = await this.prisma.task.create({
      data: {
        companyId: user.companyId,
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriority || 'MEDIUM',
        status: 'TODO' as TaskStatus,
        createdById: userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    // Assigner la tâche aux utilisateurs spécifiés
    if (data.assigneeIds && data.assigneeIds.length > 0) {
      await this.prisma.taskAssignment.createMany({
        data: data.assigneeIds.map((assigneeId: number) => ({
          taskId: task.id,
          userId: assigneeId,
        })),
      });
    }

    return this.prisma.task.findUnique({
      where: { id: task.id },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
  }

  async getMyTasks(userId: number) {
    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { createdById: userId },
          {
            assignments: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        comments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    });

    return tasks;
  }

  async complete(id: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        OR: [
          { createdById: userId },
          {
            assignments: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });

    if (!task) {
      throw new NotFoundException('Tâche non trouvée ou non assignée');
    }

    if (task.status === 'DONE') {
      throw new BadRequestException('Cette tâche est déjà terminée');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: 'DONE',
        completedAt: new Date(),
        completedById: userId,
      },
      include: {
        createdBy: { select: { id: true, email: true } },
        completedBy: { select: { id: true, email: true } },
        assignments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
  }

  async assign(id: number, assigneeId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Tâche non trouvée');
    }

    // Vérifier si déjà assigné
    const existingAssignment = await this.prisma.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId: id,
          userId: assigneeId,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('Cet utilisateur est déjà assigné à cette tâche');
    }

    await this.prisma.taskAssignment.create({
      data: {
        taskId: id,
        userId: assigneeId,
      },
    });

    return this.prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignments: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
  }

  async addComment(taskId: number, userId: number, content: string, attachments?: any) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { createdById: userId },
          {
            assignments: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });

    if (!task) {
      throw new NotFoundException('Tâche non trouvée');
    }

    return this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
        attachments: attachments || null,
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }
}
