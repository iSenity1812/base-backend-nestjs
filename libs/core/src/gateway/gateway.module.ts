import { Module, type Provider, type Type } from '@nestjs/common';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { CqrsModule, type ICommand } from '@nestjs/cqrs';

type GatewayRoutingConfig = {
  services: ServiceConfig[];
};

type ServiceConfig = {
  serviceId: string;
  transport: MicroserviceOptions;
};

@Module({
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {
  static forRoot(config: GatewayRoutingConfig) {
    const RegisteredClients: Provider = {
      provide: 'RegisteredClients',
      useFactory: (gatewayService: GatewayService) => {
        return config.services.forEach((service) => {
          return gatewayService.registerClient(
            service.serviceId,
            service.transport,
          );
        });
      },
      inject: [GatewayService],
    };

    return {
      global: true,
      module: GatewayModule,
      imports: [CqrsModule],
      controllers: [GatewayController],
      providers: [GatewayService, RegisteredClients],
      exports: [GatewayService, CqrsModule, RegisteredClients],
    };
  }

  static forFeature(operations: Record<string, Type<ICommand>>) {
    const RegisteredOperations: Provider = {
      provide:
        'REGISTERED_OPERATIONS_' + Math.random().toString(36).substring(7),
      useFactory: (gatewayService: GatewayService) => {
        Object.entries(operations).forEach(([operationId, command]) => {
          gatewayService.registerOperation(operationId, command);
        });
      },
      inject: [GatewayService],
    };
    return {
      module: GatewayModule,
      providers: [RegisteredOperations],
    };
  }
}
