import { Module } from '@nestjs/common';

import { AxiosService } from './axios.service';

@Module({
  providers: [AxiosService],
  exports: [AxiosService], // Export the service so it can be used in other modules
})
export class AxiosModule {
  static forRoot() {
    return {
      global: true,
      module: AxiosModule,
    };
  }
}
