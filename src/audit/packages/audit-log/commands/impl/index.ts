import { AUDIT_OPERATION } from '@app/common/constants';
import { CreateAuditLogCommand } from './create-audit-log.command';

export const OperationsMap = {
  [AUDIT_OPERATION.CREATE_AUDIT_LOG]: CreateAuditLogCommand,
};

export * from './create-audit-log.command';
