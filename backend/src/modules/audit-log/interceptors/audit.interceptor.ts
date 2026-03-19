import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from '../audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        if (user) {
          const { method, url, ip, body } = request;
          this.auditLogService.createLog({
            action: `${method} ${url}`,
            userId: user.userId,
            companyId: user.companyId,
            entityType: url.split('/')[2] || 'unknown',
            newData: body,
            ip: ip,
          });
        }
      }),
    );
  }
}
