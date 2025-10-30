import { BaseCommand } from '@app/common/base';

export class CreateAuditLogCommand extends BaseCommand {
  action!: string;
  actor?: { id?: string; type?: string };
  resourceType?: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}
