import { BaseCRUDController } from '@app/common';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OpenIdProviderEntity } from '../entities/openid-provider.entity';
import { OpenIdProviderDto } from '../dtos/openid-provider.dto';
import type { OpenIdProviderService } from '../services/openid-provider.service';

@ApiTags('Account / OpenID Provider')
@Controller('api/account/openid-provider')
export class OpenIdProviderController extends BaseCRUDController({
  entity: OpenIdProviderEntity,
  entityDto: OpenIdProviderDto,
  allowFindAll: true,
}) {
  constructor(private readonly oidcProviderService: OpenIdProviderService) {
    super(oidcProviderService);
  }
}
