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
          this.auditLogService.createLog({
            action: `${request.method} ${request.url}`,
            userId: user.userId,
            ip: request.ip,
            payload: request.body,
          });
        }
      }),
    );
  }
}
