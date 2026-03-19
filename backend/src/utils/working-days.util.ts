export class WorkingDaysUtil {
  /**
   * Calcule le nombre de jours ouvrés entre deux dates
   * (exclut les weekends et les jours fériés)
   */
  static calculateWorkingDays(startDate: Date, endDate: Date, holidays: Date[] = []): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Dimanche = 0, Samedi = 6
      const isHoliday = holidays.some(holiday => 
        holiday.toDateString() === current.toDateString()
      );

      if (!isWeekend && !isHoliday) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Calcule le nombre de jours calendaires entre deux dates
   */
  static calculateCalendarDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Vérifie si une date est un jour ouvré
   */
  static isWorkingDay(date: Date, holidays: Date[] = []): boolean {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.some(holiday => 
      holiday.toDateString() === date.toDateString()
    );

    return !isWeekend && !isHoliday;
  }

  /**
   * Ajoute des jours ouvrés à une date
   */
  static addWorkingDays(date: Date, days: number, holidays: Date[] = []): Date {
    const result = new Date(date);
    let remainingDays = days;

    while (remainingDays > 0) {
      result.setDate(result.getDate() + 1);
      if (this.isWorkingDay(result, holidays)) {
        remainingDays--;
      }
    }

    return result;
  }

  /**
   * Obtient la liste des jours fériés pour une année (exemple Rwanda)
   */
  static getPublicHolidays(year: number): Date[] {
    return [
      new Date(year, 0, 1),   // Nouvel an
      new Date(year, 1, 1),   // Jour des héros
      new Date(year, 4, 1),   // Fête du travail
      new Date(year, 6, 4),   // Jour de la libération
      new Date(year, 7, 15),  // Assomption
      new Date(year, 9, 1),   // Jour des patriotes
      new Date(year, 9, 14),  // Jour de la démocratie
      new Date(year, 11, 25), // Noël
      new Date(year, 11, 26), // Lendemain de Noël
    ];
  }
}
