import {
  ApiResponse,
  ApiResponseDto,
  JwtAuthGuard,
  ResponseBuilder,
} from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AccountUserService } from '../services/account-user.service';
import { UserDto } from '../dtos/user.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UserSession } from '@app/common/decorators';
import type { TokenPayload } from '@app/common/interfaces';
import type { UpdateMeDto } from '../dtos/update-me.dto';
import type { ChangePasswordDto } from '../dtos/change-password.dto';

@ApiTags('Account / Me')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'api/account/me',
  version: '1',
})
export class AccountMeController {
  constructor(private readonly userService: AccountUserService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    type: ApiResponseDto(UserDto),
    description: 'Current user profile',
  })
  @ApiBearerAuth()
  @UseInterceptors(CacheInterceptor)
  async me(@UserSession() user: TokenPayload) {
    const { data } = await this.userService.findById(user.sub);
    return ResponseBuilder.createResponse({ data });
  }

  @Put()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({
    type: ApiResponseDto(UserDto),
    description: 'Updated user profile',
  })
  @ApiBearerAuth()
  async updateMe(
    @UserSession() user: TokenPayload,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    const updated = await this.userService.update(user.sub, updateMeDto);
    return ResponseBuilder.createResponse({ data: updated });
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Password changed successfully',
  })
  @ApiBearerAuth()
  async changePassword(
    @UserSession() user: TokenPayload,
    @Body() payload: ChangePasswordDto,
  ) {
    const { currentPassword, newPassword, confirmNewPassword } = payload;
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match',
      );
    }
    const result = await this.userService.changePassword(
      user.sub,
      currentPassword,
      newPassword,
    );
    return ResponseBuilder.createResponse({
      data: result,
      message: 'Password changed successfully',
    });
  }
}
