import { UserSession } from '@app/common/decorators';
import { JwtAuthGuard } from '@app/common/guards';
import { TokenPayload } from '@app/common/interfaces';
import { ApiResponseDto, ResponseBuilder } from '@app/common/utils/dto';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AccountAuthenticateService } from '../services/account-authenticate.service';

@ApiTags('Account / Authenticate')
@Controller('api/account/auth')
export class AccountAuthenticateController {
  constructor(
    private readonly authenticateService: AccountAuthenticateService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return access/refresh tokens',
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: ApiResponseDto(LoginResponseDto) })
  async login(@Body() loginDto: LoginRequestDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = (req as any).ip || (req as any).connection.remoteAddress;

    const loginResponse = await this.authenticateService.login(
      loginDto,
      userAgent,
      ipAddress,
    );

    return ResponseBuilder.createResponse({ data: loginResponse });
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Generate new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: ApiResponseDto(LoginResponseDto) })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    const refreshResponse = await this.authenticateService.refresh(refreshDto);
    return ResponseBuilder.createResponse({ data: refreshResponse });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidate refresh token and logout user',
  })
  async logout(@UserSession() user: TokenPayload) {
    await this.authenticateService.logout(user.sub);
    return ResponseBuilder.createResponse({
      message: 'Logged out successfully',
      data: null,
    });
  }
}
