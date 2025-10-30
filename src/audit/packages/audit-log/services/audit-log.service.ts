import { Repository } from 'typeorm';

import { BaseCRUDService } from '@app/common/base';
import { ACCOUNT_OPERATION } from '@app/common/constants';
import { PopulateResultDto } from '@app/common/utils/dto';
import { GatewayService } from '@app/core/gateway';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import type { FiltersDto } from '../dtos/filters.dto';
import { AuditLog } from '../entities/audit-log.entity';

interface DiffChange {
  path: string;
  type: 'edit' | 'add' | 'remove';
  oldValue?: any;
  newValue?: any;
}

interface DiffResult {
  changes: DiffChange[];
  summary: {
    changedKeysCount: number;
  };
}

@Injectable()
export class AuditLogService extends BaseCRUDService<AuditLog> {
  private readonly redactFields = ['password', 'secret', 'token', 'key'];
  private readonly maxPayloadSize = 10000; // 10KB limit

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly gatewayService: GatewayService,
  ) {
    super(auditLogRepository);
  }

  /**
   * Return distinct actions and resource types from audit logs.
   * Used by frontend to populate filters.
   */
  async getDistinctActionsAndResources(): Promise<FiltersDto> {
    const actionsRaw = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('DISTINCT audit.action', 'action')
      .orderBy('"action"', 'ASC')
      .getRawMany();

    const resourcesRaw = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('DISTINCT audit.resourceType', 'resourceType')
      .where('audit.resourceType IS NOT NULL')
      .orderBy('"resourceType"', 'ASC')
      .getRawMany();

    const actions = actionsRaw
      .map((r) => (r && r.action ? String(r.action) : ''))
      .filter(Boolean);
    const resources = resourcesRaw
      .map((r) => (r && r.resourceType ? String(r.resourceType) : ''))
      .filter(Boolean);

    return { actions, resources };
  }

  /**
   * Override populate method to handle actor data population
   */
  async populate(
    populateFields: string[],
    entities: AuditLog | AuditLog[],
  ): Promise<PopulateResultDto> {
    const result: PopulateResultDto = {};
    const entitiesArray = Array.isArray(entities) ? entities : [entities];

    for (const field of populateFields) {
      if (field === 'actor') {
        // Get unique actor IDs that are not null/undefined
        const actorIds = [
          ...new Set(
            entitiesArray
              .map((entity) => entity.actorId)
              .filter((id): id is string => !!id),
          ),
        ];

        if (actorIds.length > 0) {
          try {
            // Fetch user data via gateway service using batch operation
            try {
              result.actor = await this.gatewayService.runCommand({
                operationId: ACCOUNT_OPERATION.BATCH_GET_USERS,
                payload: { userIds: actorIds },
              });
            } catch (err) {
              console.warn('Failed to batch populate actors:', err);
              result.actor = {};
            }
          } catch (error) {
            console.warn('Failed to populate actors:', error);
            result.actor = {};
          }
        }
      }
      // Add more populate fields here as needed (e.g., 'resource')
    }

    return result;
  }
  // Override base create to accept an audit-like payload and apply sanitization/diff.
  async create(
    data: Partial<AuditLog> & {
      action: string;
      actor?: { id?: string; type?: string };
      resourceType?: string;
      resourceId?: string;
      oldValue?: any;
      newValue?: any;
      metadata?: Record<string, any>;
    },
  ): Promise<AuditLog> {
    const sanitizedOldValue = this.sanitizePayload(data.oldValue);
    const sanitizedNewValue = this.sanitizePayload(data.newValue);

    let diff: DiffResult | null = null;
    if (sanitizedOldValue && sanitizedNewValue) {
      diff = this.computeJsonDiff(sanitizedOldValue, sanitizedNewValue);
    }

    const auditLogData: Partial<AuditLog> = {
      action: data.action,
      actorId: data.actor?.id,
      actorType: data.actor?.type,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      oldValue: sanitizedOldValue,
      newValue: sanitizedNewValue,
      diff,
      metadata: data.metadata,
    };

    const auditLog = this.auditLogRepository.create(auditLogData as AuditLog);

    return await this.auditLogRepository.save(auditLog);
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return payload;

    const serialized = JSON.stringify(payload);
    if (serialized.length > this.maxPayloadSize) {
      return {
        _truncated: true,
        _originalSize: serialized.length,
        _summary: `Payload truncated (${serialized.length} bytes)`,
        _checksum: this.simpleChecksum(serialized),
      };
    }

    return this.redactSensitiveFields(payload);
  }

  private redactSensitiveFields(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactSensitiveFields(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        this.redactFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = this.redactSensitiveFields(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  private computeJsonDiff(oldObj: any, newObj: any, maxDepth = 5): DiffResult {
    const changes: DiffChange[] = [];
    this.deepDiff(oldObj, newObj, '', changes, 0, maxDepth);

    return {
      changes,
      summary: {
        changedKeysCount: changes.length,
      },
    };
  }

  private deepDiff(
    oldObj: any,
    newObj: any,
    path: string,
    changes: DiffChange[],
    depth: number,
    maxDepth: number,
  ): void {
    if (depth >= maxDepth) return;

    if (
      typeof oldObj !== 'object' ||
      typeof newObj !== 'object' ||
      oldObj === null ||
      newObj === null
    ) {
      if (oldObj !== newObj) {
        changes.push({
          path: path || 'root',
          type: 'edit',
          oldValue: oldObj,
          newValue: newObj,
        });
      }
      return;
    }

    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      if (!(key in oldObj)) {
        changes.push({
          path: currentPath,
          type: 'add',
          newValue,
        });
      } else if (!(key in newObj)) {
        changes.push({
          path: currentPath,
          type: 'remove',
          oldValue,
        });
      } else if (typeof oldValue === 'object' && typeof newValue === 'object') {
        this.deepDiff(
          oldValue,
          newValue,
          currentPath,
          changes,
          depth + 1,
          maxDepth,
        );
      } else if (oldValue !== newValue) {
        changes.push({
          path: currentPath,
          type: 'edit',
          oldValue,
          newValue,
        });
      }
    }
  }

  private simpleChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}
