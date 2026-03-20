import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: any,
    @CurrentCompany() companyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.upload(user.userId, companyId, file, createDocumentDto);
  }

  @Get()
  findAll(
    @CurrentCompany() companyId: number,
    @Query('my') my?: string,
    @CurrentUser() user?: any,
  ) {
    if (my === 'true') {
      return this.documentsService.findAll(companyId, user.userId);
    }
    return this.documentsService.findAll(companyId);
  }

  @Get('types')
  getDocumentTypes(@CurrentCompany() companyId: number) {
    return this.documentsService.getDocumentTypes(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.documentsService.findOne(+id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(+id, companyId, updateDocumentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.documentsService.remove(+id, companyId);
  }
}
