import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { VerifyAccessTokenCommand } from '../impl';
import { AccountTokenService } from '../../services/account-token.service';
import { TokenPayload } from '@app/common/interfaces';

@CommandHandler(VerifyAccessTokenCommand)
export class VerifyAccessTokenHandler
  implements ICommandHandler<VerifyAccessTokenCommand>
{
  constructor(private readonly tokenService: AccountTokenService) {}

  async execute(command: VerifyAccessTokenCommand): Promise<TokenPayload> {
    return this.tokenService.verifyAccessToken(command.token);
  }
}
