import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@app/common/base';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actorId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actorType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue?: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue?: any;

  @Column({ type: 'jsonb', nullable: true })
  diff?: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
