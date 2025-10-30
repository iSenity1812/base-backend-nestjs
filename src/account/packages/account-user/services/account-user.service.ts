import {
  BaseCRUDService,
  PasswordHash,
  type ClsContextService,
} from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { GatewayService } from '@app/core/gateway';
import { AUDIT_ACTION, AUDIT_OPERATION } from '@app/common/constants';

@Injectable()
export class AccountUserService extends BaseCRUDService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly gatewayService: GatewayService,
    private readonly clsContextService: ClsContextService,
  ) {
    super(repo);
  }

  // AUDIT LOG
  async logAudit(action: string, oldData: any, newData: any, metadata?: any) {
    try {
      const actorId = this.clsContextService.getActorId();
      await this.gatewayService.runCommand({
        operationId: AUDIT_OPERATION.CREATE_AUDIT_LOG,
        payload: {
          action,
          actor: { id: actorId || 'system', type: actorId ? 'user' : 'system' },
          resourceType: 'user',
          resourceId: newData?.id || oldData?.id || null,
          oldData,
          newData,
          metadata, // can be null or any additional info
        },
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const before = await this.repo.findOne({ where: { id: userId } });

    if (
      !before ||
      !before.password ||
      !PasswordHash.comparePassword(currentPassword, before.password)
    ) {
      throw new BadRequestException('Invalid current password');
    }

    const hashedPassword = PasswordHash.hashPassword(newPassword);
    const updated = await this.update(userId, {
      password: hashedPassword,
    } as any);

    await this.logAudit(AUDIT_ACTION.USER.CHANGE_PASSWORD, before, updated, {
      reason: 'User initiated password change', // change-password
    });
    return updated;
  }

  override async getSearchableColumns(): Promise<string[]> {
    return ['username', 'email', 'fullName'];
  }

  async findByUsernameOrEmail(identifier: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
  }

  async findByIds(ids: string[]): Promise<UserEntity[]> {
    if (!ids || ids.length === 0) return [];
    return this.repo
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids })
      .getMany();
  }

  /**
   * Returns metrics about users
   * - total number of users
   * - count of users by status (count per each UserStatus)
   */
  async getMetrics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    const qb = this.repo
      .createQueryBuilder('user')
      .select('COUNT(user.id)', 'total');
    const totalRaw = await qb.getRawOne();
    const total = Number(totalRaw?.total ?? 0);

    // count by status
    const byStatusRows = await this.repo
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.status')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const row of byStatusRows) {
      byStatus[String(row.status)] = Number(row.count);
    }
    return { total, byStatus };
  }

  // overrides for CRUD operations to handle populate
  override async create(entity: UserEntity): Promise<UserEntity> {
    const created = await super.create(entity);
    await this.logAudit(AUDIT_ACTION.USER.CREATE, null, created);
    return created;
  }

  override async update(
    id: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const before = await this.repo.findOne({ where: { id } });
    const updated = await super.update(id, data as any);
    await this.logAudit(AUDIT_ACTION.USER.UPDATE, before, updated);
    return updated;
  }

  override async delete(id: string): Promise<void> {
    const before = await this.repo.findOne({ where: { id } });
    await super.delete(id);
    await this.logAudit(AUDIT_ACTION.USER.DELETE, before, null);
  }
}
