import {
  BaseCRUDController,
  JwtAuthGuard,
  ResponseBuilder,
  TokenRoleGuard,
  ApiResponse,
} from '@app/common';
import { TokenRoles } from '@app/common/decorators';
import { TokenRole } from '@app/common/enums';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import type { AccountUserService } from '../services/account-user.service';
import { UserMetricsDto } from '../dtos/user-metrics.dto';

@ApiTags('Account / User')
@UseGuards(JwtAuthGuard, TokenRoleGuard)
@TokenRoles(TokenRole.ADMIN, TokenRole.SUPER_ADMIN)
@Controller({
  path: 'api/account/user',
  version: '1',
})
export class AccountUserController extends BaseCRUDController({
  entity: UserEntity,
  entityDto: UserDto,
  createDto: CreateUserDto,
  updateDto: UpdateUserDto,
  allowDelete: true,
}) {
  constructor(private readonly userService: AccountUserService) {
    super(userService);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get user metrics (total, by status)' })
  @ApiOkResponse({ type: ApiResponse<UserMetricsDto> })
  @ApiBearerAuth()
  async metrics(): Promise<ApiResponse<UserMetricsDto>> {
    const metrics = await this.userService.getMetrics();
    return ResponseBuilder.createResponse<UserMetricsDto>({
      data: {
        total: metrics.total,
        byStatus: metrics.byStatus,
      },
    });
  }
}
