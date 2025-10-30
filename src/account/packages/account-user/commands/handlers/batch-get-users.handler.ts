import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { BatchGetUsersCommand } from '../impl';
import { Injectable } from '@nestjs/common';
import type { AccountUserService } from '../../services/account-user.service';
import { plainToInstance } from 'class-transformer/types';
import { PublicUserDto } from '../../dtos/user.dto';

@CommandHandler(BatchGetUsersCommand)
@Injectable()
export class BatchGetUserHandler
  implements ICommandHandler<BatchGetUsersCommand>
{
  constructor(private readonly userService: AccountUserService) {}

  async execute(command: BatchGetUsersCommand): Promise<any> {
    const { userIds } = command;
    const users = await this.userService.findByIds(userIds);

    const result: Record<string, any> = {};
    users.forEach((user) => {
      if (user && (user as any).id) {
        result[(user as any).id] = plainToInstance(PublicUserDto, user, {
          excludeExtraneousValues: true,
        });
      }
    });
    return result;
  }
}
