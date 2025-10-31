import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl';
import { AccountUserService } from '../../services/account-user.service';
import { UserEntity } from '../../entities/user.entity';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: AccountUserService) {}

  async execute(command: CreateUserCommand): Promise<UserEntity> {
    const user = UserEntity.create({
      email: command.email,
      username: command.username,
      password: command.password,
      role: command.role,
      fullName: command.fullName,
    });
    return this.userService.create(user);
  }
}
