import { Injectable, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';
import { ExportOptionsDto, ExportFormat, ExportEntity } from './dto/export-options.dto';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportData(options: ExportOptionsDto, res: Response) {
    const data = await this.fetchData(options.entity, options.filters, options.startDate, options.endDate);
    
    switch (options.format) {
      case ExportFormat.EXCEL:
        return this.exportToExcel(data, options.entity, options.fields, res);
      case ExportFormat.PDF:
        return this.exportToPDF(data, options.entity, options.fields, res);
      case ExportFormat.CSV:
        return this.exportToCSV(data, options.entity, options.fields, res);
      default:
        throw new BadRequestException('Format non supporté');
    }
  }

  private async fetchData(entity: ExportEntity, filters?: any, startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    switch (entity) {
      case ExportEntity.USERS:
        return this.prisma.user.findMany({
          where,
          include: { 
            role: true,
            employeeInfo: true,
          },
        });
      case ExportEntity.ROLES:
        return this.prisma.role.findMany({
          where,
          // Les permissions sont stockées en JSON, pas besoin d'include
        });
      case ExportEntity.PERMISSIONS:
        // Les permissions n'existent plus en tant que table
        throw new BadRequestException('Permissions export not available in new schema');
      case ExportEntity.AUDIT_LOGS:
        return this.prisma.auditLog.findMany({
          where,
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        });
      default:
        throw new BadRequestException('Entité non supportée');
    }
  }

  private async exportToExcel(data: any[], entity: ExportEntity, fields: string[] | undefined, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(entity.toString());

    // Définir les colonnes
    const columns = this.getColumns(entity, fields);
    worksheet.columns = columns;

    // Ajouter les données
    data.forEach(item => {
      const row = {};
      columns.forEach(col => {
        row[col.key] = this.getNestedValue(item, col.key);
      });
      worksheet.addRow(row);
    });

    // Styliser l'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Ajuster la largeur des colonnes
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${entity}-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  private async exportToPDF(data: any[], entity: ExportEntity, fields: string[] | undefined, res: Response) {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${entity}-${Date.now()}.pdf`);

    doc.pipe(res);

    // Titre
    doc.fontSize(20).text(`Export ${entity}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Généré le ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Données
    const columns = this.getColumns(entity, fields);
    
    data.forEach((item, index) => {
      doc.fontSize(10).text(`${index + 1}. ${this.formatItemForPDF(item, columns)}`);
      doc.moveDown(0.5);
      
      // Nouvelle page si nécessaire
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.end();
  }

  private async exportToCSV(data: any[], entity: ExportEntity, fields: string[] | undefined, res: Response) {
    const columns = this.getColumns(entity, fields);
    
    // Créer l'en-tête CSV
    let csv = columns.map(col => col.header).join(',') + '\n';
    
    // Ajouter les données
    data.forEach(item => {
      const row = columns.map(col => {
        const value = this.getNestedValue(item, col.key);
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value instanceof Date) return `"${value.toISOString()}"`;
        return value;
      }).join(',');
      csv += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${entity}-${Date.now()}.csv`);
    res.send(csv);
  }

  private getColumns(entity: ExportEntity, fields?: string[]) {
    const allColumns = {
      [ExportEntity.USERS]: [
        { header: 'ID', key: 'id' },
        { header: 'Email', key: 'email' },
        { header: 'Rôle', key: 'role.name' },
        { header: 'Prénom', key: 'employeeInfo.firstName' },
        { header: 'Nom', key: 'employeeInfo.lastName' },
        { header: 'Département', key: 'employeeInfo.departmentId' },
        { header: 'Actif', key: 'isActive' },
        { header: 'Créé le', key: 'createdAt' },
      ],
      [ExportEntity.ROLES]: [
        { header: 'ID', key: 'id' },
        { header: 'Nom', key: 'name' },
        { header: 'Description', key: 'description' },
        { header: 'Créé le', key: 'createdAt' },
      ],
      [ExportEntity.AUDIT_LOGS]: [
        { header: 'ID', key: 'id' },
        { header: 'Action', key: 'action' },
        { header: 'Utilisateur', key: 'user.email' },
        { header: 'Type', key: 'entityType' },
        { header: 'IP', key: 'ip' },
        { header: 'Date', key: 'createdAt' },
      ],
    };

    let columns = allColumns[entity] || [];
    
    if (fields && fields.length > 0) {
      columns = columns.filter(col => fields.includes(col.key));
    }

    return columns;
  }

  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatItemForPDF(item: any, columns: any[]) {
    return columns.map(col => {
      const value = this.getNestedValue(item, col.key);
      return `${col.header}: ${value !== null && value !== undefined ? value : ''}`;
    }).join(' | ');
  }
}
