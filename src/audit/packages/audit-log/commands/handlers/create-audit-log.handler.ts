import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CreateAuditLogCommand } from '../impl';
import type { AuditLogService } from '../../services/audit-log.service';

@CommandHandler(CreateAuditLogCommand)
export class CreateAuditHandler
  implements ICommandHandler<CreateAuditLogCommand>
{
  constructor(private readonly auditService: AuditLogService) {}

  async execute(command: CreateAuditLogCommand): Promise<any> {
    return await this.auditService.create({
      action: command.action,
      actor: command.actor,
      resourceType: command.resourceType,
      resourceId: command.resourceId,
      oldValue: command.oldValue,
      newValue: command.newValue,
      metadata: command.metadata,
    });
  }
}
