import {
  clientsMap,
  operationsMap,
} from '@app/common/constants/global.constants';
import { Injectable, Logger, type Type } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { ICommand } from '@nestjs/cqrs';
import {
  ClientProxyFactory,
  type MicroserviceOptions,
} from '@nestjs/microservices';
import type { RunOperationDto } from './dtos/run-operation.dto';
import { firstValueFrom } from 'rxjs';
import type { RunCommandDto } from './dtos/run-command.dto';
import { plainToInstance } from 'class-transformer';
import { GatewayException } from '@app/common/exceptions';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(private readonly commandBus: CommandBus) {}

  registerClient(serviceId: string, microserviceOption: MicroserviceOptions) {
    const client = ClientProxyFactory.create(microserviceOption as any);
    clientsMap.set(serviceId, client);
    this.logger.log(`Registered client for serviceId: ${serviceId}`);
  }

  registerOperation(operationId: string, command: Type<ICommand>) {
    operationsMap.set(operationId, command);
    this.logger.log(`Registered operation: ${operationId}`);
  }

  async runOperation<Result = unknown>(dto: RunOperationDto): Promise<Result> {
    const { serviceId } = dto;
    const client = clientsMap.get(serviceId);
    if (!client) {
      throw new Error(`Client for serviceId ${serviceId} not found`);
    }
    this.logger.verbose(`Running operation`, JSON.stringify(dto));
    return firstValueFrom(client.send(`gateway.runOperation`, dto));
  }

  async runCommand(dto: RunCommandDto) {
    try {
      const command = operationsMap.get(dto.operationId);
      if (!command) {
        throw new Error(`Operation ${dto.operationId} not registered`);
      }
      const commandDto = plainToInstance(command, dto.payload);
      this.logger.verbose(`Executing command`, JSON.stringify(dto));
      return this.commandBus.execute(commandDto);
    } catch (error) {
      this.logger.error(error);
      throw new GatewayException(
        error.message,
        JSON.stringify({ cause: error }),
      );
    }
  }
}
