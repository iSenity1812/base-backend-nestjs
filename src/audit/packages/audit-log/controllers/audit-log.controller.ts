import {
  ApiResponseDto,
  BaseCRUDController,
  JwtAuthGuard,
  ResponseBuilder,
  TokenRoleGuard,
} from '@app/common';
import { TokenRoles } from '@app/common/decorators';
import { TokenRole } from '@app/common/enums';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogDto } from '../dtos/audit-log.dto';
import type { AuditLogService } from '../services/audit-log.service';
import { FiltersDto } from '../dtos/filters.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Audit / Audit Log')
@UseGuards(JwtAuthGuard, TokenRoleGuard)
@TokenRoles(TokenRole.SUPER_ADMIN, TokenRole.ADMIN)
@Controller({ path: '/api/audit/log', version: '1' })
export class AuditLogController extends BaseCRUDController<
  AuditLog,
  AuditLogDto,
  any,
  any
>({
  entity: AuditLog,
  entityDto: AuditLogDto,
  allowDelete: false,
  allowFindAll: true,
}) {
  constructor(private readonly auditService: AuditLogService) {
    super(auditService);
  }

  @Get('filters')
  @ApiOperation({
    summary: 'Get available audit actions and resource types for filtering',
  })
  @ApiOkResponse({ type: ApiResponseDto(FiltersDto) })
  @ApiBearerAuth()
  @CacheTTL(60000) // Cache for 1 minute
  @UseInterceptors(CacheInterceptor)
  async filters() {
    const { actions, resources } =
      await this.auditService.getDistinctActionsAndResources();
    return ResponseBuilder.createResponse({ data: { actions, resources } });
  }
}
