import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) {
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: { userId, status: 'APPROVED' },
    });

    const totalDays = leaveRequests.reduce((sum, request) => {
      const days = Math.ceil(
        (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) + 1;
      return sum + days;
    }, 0);

    // Récupérer les soldes par type de congé
    const balances = await this.prisma.leaveBalance.findMany({
      where: { userId },
      include: { leaveType: true },
    });

    return {
      total: 25, // Congés annuels par défaut
      used: totalDays,
      remaining: 25 - totalDays,
      details: balances,
    };
  }

  async getRequests(userId: number) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        leaveType: true,
        approvedBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(userId: number, data: any) {
    // Récupérer l'utilisateur pour avoir companyId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si le type de congé existe
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { 
        companyId: user.companyId,
        name: data.type || 'ANNUAL',
      },
    });

    if (!leaveType) {
      throw new NotFoundException('Type de congé non trouvé');
    }

    return this.prisma.leaveRequest.create({
      data: {
        companyId: user.companyId,
        userId,
        leaveTypeId: leaveType.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        daysCount: data.daysCount || 1,
        reason: data.reason,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
      },
    });
  }

  async approveRequest(id: number, managerId: number) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Demande de congé non trouvée');
    }

    // Vérifier si le manager est bien le manager de l'employé
    const employeeInfo = await this.prisma.employeeInfo.findUnique({
      where: { userId: leaveRequest.userId },
    });

    if (employeeInfo && employeeInfo.managerId !== managerId) {
      // Si pas manager direct, vérifier si c'est un admin
      const manager = await this.prisma.user.findUnique({
        where: { id: managerId },
        include: { role: true },
      });

      if (!manager || manager.role.name !== 'ADMIN') {
        throw new NotFoundException('Non autorisé à approuver cette demande');
      }
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: managerId,
        approvedAt: new Date(),
      },
      include: {
        leaveType: true,
        approvedBy: { select: { id: true, email: true } },
      },
    });
  }

  async getBalances(userId: number) {
    return this.prisma.leaveBalance.findMany({
      where: { userId },
      include: { leaveType: true },
      orderBy: { year: 'desc' },
    });
  }
}
