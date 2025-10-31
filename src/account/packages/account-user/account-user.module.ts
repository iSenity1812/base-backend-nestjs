import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { GatewayModule } from '@app/core/gateway';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { OperationsMap } from './commands/impl';
import { AccountUserController } from './controllers/account-user.controller';
import { AccountMeController } from './controllers/account-me.controller';
import { AccountUserService } from './services/account-user.service';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity]),
    GatewayModule.forFeature(OperationsMap),
  ],
  controllers: [AccountUserController, AccountMeController],
  providers: [AccountUserService, ...CommandHandlers],
  exports: [TypeOrmModule],
})
export class AccountUserModule {}
