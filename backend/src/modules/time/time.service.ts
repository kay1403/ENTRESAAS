import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimeService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: number) {
    // Récupérer l'utilisateur pour avoir companyId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Vérifier s'il y a déjà un check-in aujourd'hui sans check-out
    const existingEntry = await this.prisma.timeEntry.findFirst({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: 'CHECK_IN',
      },
    });

    if (existingEntry) {
      // Vérifier si un check-out existe aussi aujourd'hui
      const hasCheckOut = await this.prisma.timeEntry.findFirst({
        where: {
          userId,
          timestamp: {
            gte: today,
            lt: tomorrow,
          },
          type: 'CHECK_OUT',
        },
      });

      if (!hasCheckOut) {
        throw new BadRequestException('Vous avez déjà un check-in actif sans check-out');
      }
    }

    return this.prisma.timeEntry.create({
      data: {
        companyId: user.companyId,
        userId,
        type: 'CHECK_IN',
        timestamp: new Date(),
        workDate: today,
      },
    });
  }

  async checkOut(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Vérifier s'il y a un check-in aujourd'hui
    const checkIn = await this.prisma.timeEntry.findFirst({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: 'CHECK_IN',
      },
    });

    if (!checkIn) {
      throw new BadRequestException('Aucun check-in trouvé pour aujourd\'hui');
    }

    // Vérifier si un check-out existe déjà
    const existingCheckOut = await this.prisma.timeEntry.findFirst({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        type: 'CHECK_OUT',
      },
    });

    if (existingCheckOut) {
      throw new BadRequestException('Check-out déjà effectué aujourd\'hui');
    }

    return this.prisma.timeEntry.create({
      data: {
        companyId: user.companyId,
        userId,
        type: 'CHECK_OUT',
        timestamp: new Date(),
        workDate: today,
      },
    });
  }

  async getTodayEntries(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Calculer le résumé
    let totalWorkMinutes = 0;
    let checkInTime: Date | null = null;

    for (const entry of entries) {
      if (entry.type === 'CHECK_IN') {
        checkInTime = entry.timestamp;
      } else if (entry.type === 'CHECK_OUT' && checkInTime) {
        const diff = (entry.timestamp.getTime() - checkInTime.getTime()) / (1000 * 60);
        totalWorkMinutes += diff;
        checkInTime = null;
      }
    }

    return {
      entries,
      summary: {
        totalWorkMinutes: Math.round(totalWorkMinutes),
        totalHours: (totalWorkMinutes / 60).toFixed(2),
        checkInCount: entries.filter(e => e.type === 'CHECK_IN').length,
        checkOutCount: entries.filter(e => e.type === 'CHECK_OUT').length,
      },
    };
  }

  async getHistory(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Grouper par date
    const grouped: Record<string, any> = {};
    entries.forEach(entry => {
      const dateStr = entry.workDate.toISOString().split('T')[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          entries: [],
        };
      }
      grouped[dateStr].entries.push(entry);
    });

    return Object.values(grouped);
  }

  async getWeekSummary(userId: number) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Dimanche = début de semaine
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Grouper par jour
    const daily: Record<string, any> = {};
    entries.forEach(entry => {
      const dateStr = entry.workDate.toISOString().split('T')[0];
      if (!daily[dateStr]) {
        daily[dateStr] = {
          date: dateStr,
          entries: [],
          totalMinutes: 0,
        };
      }
      daily[dateStr].entries.push(entry);
    });

    // Calculer les totaux par jour
    Object.keys(daily).forEach(date => {
      let dayTotal = 0;
      let checkInTime: Date | null = null;
      
      daily[date].entries.forEach((entry: any) => {
        if (entry.type === 'CHECK_IN') {
          checkInTime = entry.timestamp;
        } else if (entry.type === 'CHECK_OUT' && checkInTime) {
          const diff = (entry.timestamp.getTime() - checkInTime.getTime()) / (1000 * 60);
          dayTotal += diff;
          checkInTime = null;
        }
      });
      
      daily[date].totalMinutes = Math.round(dayTotal);
      daily[date].totalHours = (dayTotal / 60).toFixed(2);
    });

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      daily: Object.values(daily),
    };
  }
}
