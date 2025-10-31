import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { FindUserByIdentifierCommand } from '../impl';
import { AccountUserService } from '../../services/account-user.service';
import type { UserEntity } from '../../entities/user.entity';

@CommandHandler(FindUserByIdentifierCommand)
export class FindUserByIdentifierHandler
  implements ICommandHandler<FindUserByIdentifierCommand>
{
  constructor(private readonly userService: AccountUserService) {}

  async execute(
    command: FindUserByIdentifierCommand,
  ): Promise<UserEntity | null> {
    return this.userService.findByUsernameOrEmail(command.identifier);
  }
}
