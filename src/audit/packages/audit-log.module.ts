import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log/entities/audit-log.entity';
import { GatewayModule } from '@app/core/gateway';
import { OperationsMap } from './audit-log/commands/impl';
import { CqrsModule } from '@nestjs/cqrs';
import { AuditLogController } from './audit-log/controllers/audit-log.controller';
import { AuditLogService } from './audit-log/services/audit-log.service';
import { CreateAuditHandler } from './audit-log/commands/handlers/create-audit-log.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    GatewayModule.forFeature(OperationsMap),
    CqrsModule,
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, CreateAuditHandler],
  exports: [AuditLogService],
})
export class AuditLogModule {}
