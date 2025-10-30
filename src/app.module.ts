import { CommonModule } from '@app/common';
import { CoreModule } from '@app/core';
import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuditLogModule } from './audit/packages/audit-log.module';

@Module({
  imports: [
    CoreModule.forRoot(),
    CommonModule.forRoot(),

    AccountModule,
    AuditLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
