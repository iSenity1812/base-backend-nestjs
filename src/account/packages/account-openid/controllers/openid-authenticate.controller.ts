import { VisitorIdExempt } from '@app/common/decorators';
import { ApiResponseDto } from '@app/common/utils/dto';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { OpenIdCallbackDto } from '../dtos/openid-callback.dto';
import { OpenIdProviderDto } from '../dtos/openid-provider.dto';
import { OpenIdAuthenticateService } from '../services/openid-authenticate.service';

@ApiTags('Account / Authenticate / OpenID')
@Controller('api/account/openid')
export class OpenIdAuthenticateController {
  constructor(
    private readonly openIdAuthenticateService: OpenIdAuthenticateService,
  ) {}

  @Get('providers')
  @ApiOperation({
    summary: 'Get enabled authentication providers',
    description:
      'Returns list of enabled auth providers (local + OIDC) for the frontend to render login buttons',
  })
  @ApiOkResponse({ type: ApiResponseDto(OpenIdProviderDto) })
  async providers() {
    const providers = await this.openIdAuthenticateService.getProviders();
    return providers.map((p) => ({
      name: p.name,
      display_name: p.display_name,
      icon_url: p.icon_url,
    }));
  }

  @Get('/:provider/init')
  @ApiOperation({
    summary: 'Initiate OIDC login',
    description:
      'Builds OIDC authorization URL and redirects the user to the identity provider',
  })
  @ApiParam({
    name: 'provider',
    description: 'Provider identifier (e.g. google, azure, keycloak)',
    required: true,
  })
  @ApiOkResponse({
    description: 'Redirect to identity provider authorization URL',
  })
  async init(@Param('provider') provider: string, @Res() res: any) {
    const url =
      await this.openIdAuthenticateService.getAuthorizationUrl(provider);
    return res.redirect(url);
  }

  @Get('/:provider/callback')
  @VisitorIdExempt()
  @ApiOperation({
    summary: 'OIDC callback',
    description:
      'Handles provider callback, exchanges code for tokens, creates/loads user and redirects to frontend with internal token',
  })
  @ApiParam({
    name: 'provider',
    description: 'Provider identifier (e.g. google, azure, keycloak)',
    required: true,
  })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiOkResponse({
    description: 'Redirect to frontend with internal token in query string',
  })
  async callback(
    @Param('provider') provider: string,
    @Query() dto: OpenIdCallbackDto,
    @Res() res: any,
  ) {
    const { accessToken } = await this.openIdAuthenticateService.handleCallback(
      provider,
      dto as any,
    );
    return res.redirect(
      `${process.env.FE_BASE_URL || 'http://localhost:5173'}/login/callback?token=${accessToken}`,
    );
  }
}
