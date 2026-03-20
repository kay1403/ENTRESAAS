import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async upload(
    userId: number,
    companyId: number,
    file: Express.Multer.File,
    dto: CreateDocumentDto,
  ) {
    // Vérifier que le type de document existe
    const documentType = await this.prisma.documentType.findFirst({
      where: { id: dto.typeId, companyId },
    });

    if (!documentType) {
      throw new BadRequestException('Type de document non trouvé');
    }

    // Générer un nom de fichier unique
    const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
    const fileUrl = `/uploads/${fileKey}`;

    // TODO: Sauvegarder le fichier sur le disque ou dans un bucket S3
    // Pour l'instant, on simule la sauvegarde

    return this.prisma.document.create({
      data: {
        companyId,
        userId,
        typeId: dto.typeId,
        title: dto.title,
        fileName: file.originalname,
        fileKey,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        description: dto.description,
        sensitivity: dto.sensitivity || 'PUBLIC',
      },
      include: {
        user: { select: { id: true, email: true } },
        type: true,
      },
    });
  }

  async findAll(companyId: number, userId?: number) {
    const where: any = { companyId, deletedAt: null };
    
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.document.findMany({
      where,
      include: {
        user: { select: { id: true, email: true } },
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, companyId: number) {
    const document = await this.prisma.document.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
        type: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return document;
  }

  async update(id: number, companyId: number, dto: UpdateDocumentDto) {
    const document = await this.prisma.document.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return this.prisma.document.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, email: true } },
        type: true,
      },
    });
  }

  async remove(id: number, companyId: number) {
    const document = await this.prisma.document.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    // TODO: Supprimer le fichier physique

    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getDocumentTypes(companyId: number) {
    return this.prisma.documentType.findMany({
      where: { companyId, deletedAt: null },
    });
  }
}
