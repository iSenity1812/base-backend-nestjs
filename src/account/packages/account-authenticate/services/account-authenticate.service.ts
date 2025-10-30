import { Repository } from 'typeorm';

import { AUDIT_ACTION, AUDIT_OPERATION } from '@app/common/constants';
import { ClsContextService } from '@app/common/services';
import { GatewayService } from '@app/core/gateway';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { IAuthStrategy } from '../interfaces/auth-strategy.interface';
import { UserRoleToTokenRoleMapper } from '../mapper/token-role.mapper';
import { AccountTokenService } from './account-token.service';

@Injectable()
export class AccountAuthenticateService {
  constructor(
    @Inject('AUTH_STRATEGIES') private readonly strategies: IAuthStrategy[],
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly tokenService: AccountTokenService,
    private readonly mapper: UserRoleToTokenRoleMapper,
    private readonly gatewayService: GatewayService,
    private readonly clsContextService: ClsContextService,
  ) {}

  async login(
    dto: LoginRequestDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<LoginResponseDto> {
    const strategy = this.strategies.find((s) => s.method === dto.method);
    if (!strategy) {
      throw new BadRequestException(
        `Unsupported authentication method: ${dto.method}`,
      );
    }

    const user = await strategy.validate(dto.data);
    const tokenRole = this.mapper.map(user.role);
    const visitorId = this.clsContextService.getVisitorId();

    // Clean up existing refresh tokens for this user and visitor ID to prevent accumulation
    if (visitorId) {
      await this.refreshTokenRepository.delete({
        userId: user.id,
        visitorId,
      });
    }

    const { accessToken, refreshToken, refreshId, expiresIn } =
      await this.tokenService.generateTokens(user, tokenRole, dto.method);

    const refreshTokenExpiresAt = new Date(
      Date.now() + this.tokenService.getRefreshTokenExpiresIn() * 1000,
    );

    await this.refreshTokenRepository.save({
      id: refreshId,
      userId: user.id,
      tokenRole,
      expiresAt: refreshTokenExpiresAt,
      userAgent,
      ipAddress,
      visitorId,
    });

    // Create audit log for successful login
    try {
      await this.gatewayService.runCommand({
        operationId: AUDIT_OPERATION.CREATE_AUDIT_LOG,
        payload: {
          action: AUDIT_ACTION.USER.LOGIN,
          actor: { id: user.id, type: 'user' },
          resourceType: 'user',
          resourceId: user.id,
          oldValue: null,
          newValue: { userId: user.id, userAgent, ipAddress, visitorId },
          metadata: { method: dto.method },
        },
      });
    } catch (_err) {
      /* ignore audit errors */
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_role: tokenRole,
      expires_in: expiresIn,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<LoginResponseDto> {
    const visitorId = this.clsContextService.getVisitorId();
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { id: dto.refresh_token, visitorId },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken, refreshId, expiresIn } =
      await this.tokenService.generateTokens(
        { id: refreshTokenRecord.userId } as any,
        refreshTokenRecord.tokenRole,
        'refresh',
      );

    // Update refresh token record
    refreshTokenRecord.id = refreshId;
    refreshTokenRecord.expiresAt = new Date(
      Date.now() + this.tokenService.getRefreshTokenExpiresIn() * 1000,
    );
    await this.refreshTokenRepository.save(refreshTokenRecord);

    // Clear old refresh tokens
    await this.refreshTokenRepository.delete({
      userId: refreshTokenRecord.userId,
      id: dto.refresh_token,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_role: refreshTokenRecord.tokenRole,
      expires_in: expiresIn,
    };
  }

  async logout(userId: string): Promise<void> {
    const visitorId = this.clsContextService.getVisitorId();

    // If visitor ID is available, only logout tokens for this visitor
    // Otherwise, logout all tokens for the user (backward compatibility)
    if (visitorId) {
      await this.refreshTokenRepository.delete({ userId, visitorId });
    } else {
      await this.refreshTokenRepository.delete({ userId });
    }
  }
}
