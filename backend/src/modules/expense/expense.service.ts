import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: number, data: any) {
    // Récupérer l'utilisateur pour avoir companyId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que la catégorie existe
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie de dépense non trouvée');
    }

    return this.prisma.expenseClaim.create({
      data: {
        companyId: user.companyId,
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        currency: data.currency || 'RWF',
        date: new Date(data.date),
        description: data.description,
        status: 'SUBMITTED',
      },
      include: {
        category: true,
      },
    });
  }

  async getMyExpenses(userId: number) {
    return this.prisma.expenseClaim.findMany({
      where: { userId },
      include: {
        category: true,
        approvedBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number, approverId: number) {
    const expenseClaim = await this.prisma.expenseClaim.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!expenseClaim) {
      throw new NotFoundException('Note de frais non trouvée');
    }

    // Vérifier le statut actuel
    if (expenseClaim.status !== 'SUBMITTED') {
      throw new BadRequestException(`Cette note de frais ne peut pas être approuvée (statut: ${expenseClaim.status})`);
    }

    return this.prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'MANAGER_APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: {
        category: true,
        approvedBy: { select: { id: true, email: true } },
      },
    });
  }

  async financeApprove(id: number, approverId: number) {
    const expenseClaim = await this.prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!expenseClaim) {
      throw new NotFoundException('Note de frais non trouvée');
    }

    if (expenseClaim.status !== 'MANAGER_APPROVED') {
      throw new BadRequestException('Cette note de frais doit d\'abord être approuvée par un manager');
    }

    return this.prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'FINANCE_APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
      },
    });
  }

  async markAsPaid(id: number) {
    const expenseClaim = await this.prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!expenseClaim) {
      throw new NotFoundException('Note de frais non trouvée');
    }

    if (expenseClaim.status !== 'FINANCE_APPROVED') {
      throw new BadRequestException('Cette note de frais doit d\'abord être approuvée par la finance');
    }

    return this.prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }
}
