import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { GetUserInfoCommand } from '../impl';
import type { UserEntity } from '../../entities/user.entity';
import { AccountUserService } from '../../services/account-user.service';

@CommandHandler(GetUserInfoCommand)
export class GetUserInfoHandler implements ICommandHandler<GetUserInfoCommand> {
  constructor(private readonly userService: AccountUserService) {}
  async execute(command: GetUserInfoCommand): Promise<UserEntity> {
    const { data } = await this.userService.findById(command.userId);
    return data;
  }
}
