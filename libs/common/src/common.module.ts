import { ClsModule } from 'nestjs-cls';
import { Module } from '@nestjs/common';
import { ClsContextService } from './services';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
      },
    }),
  ],
  providers: [ClsContextService],
  exports: [ClsContextService],
})
export class CommonModule {
  static forRoot() {
    return {
      global: true,
      module: CommonModule,
    };
  }
}
