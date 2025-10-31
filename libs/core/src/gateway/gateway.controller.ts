import { Controller } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RunOperationDto } from './dtos/run-operation.dto';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @MessagePattern('gateway.runOperation')
  async handleGatewayRunOperation(@Payload() payload: RunOperationDto) {
    return await this.gatewayService.runCommand(payload);
  }
}
