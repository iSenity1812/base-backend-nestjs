import { VisitorIdExempt } from '@app/common/decorators';
import { HealthCheckStatus, MicroservicesStatus } from '@app/common/enums';
import { ResponseBuilder } from '@app/common/utils/dto';
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { HealthCheckResponseDto } from './dtos/health-check.dto';
import { HealthService } from './health.service';
import { Status, StatusHealthCheckResponse } from './types';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private readonly healthService: HealthService) {}
  @Get()
  @VisitorIdExempt()
  @ApiOperation({ summary: `Get Status Health Check` })
  @ApiOkResponse({
    type: HealthCheckResponseDto,
    description: `Return Health Check Status`,
  })
  async check() {
    try {
      const healthChecks = this.healthService.getHealthChecks();

      const microserviceCheckRes =
        await this.healthService.getMicroserviceHealthCheck();

      const results = await Promise.allSettled(
        healthChecks.map((check) => check()),
      );

      const healthCheckSuccessful: StatusHealthCheckResponse[] = results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === HealthCheckStatus.FULFILLED,
        )
        .map((result) => result.value);
      const healthCheckFailed: StatusHealthCheckResponse[] = results
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === HealthCheckStatus.REJECTED,
        )
        .map((result) => result.reason);

      microserviceCheckRes.forEach((service) => {
        const [_, value] = Object.entries(service)[0];
        if (value?.status === MicroservicesStatus.UP) {
          healthCheckSuccessful.push(service);
        } else {
          healthCheckFailed.push(service);
        }
      });

      return ResponseBuilder.createResponse({
        data: {
          healthCheckSuccessful,
          healthCheckFailed,
        },
      });
    } catch (error) {
      this.logger.error('Health check processing failed:', error);
      return ResponseBuilder.createResponse({
        data: error.message,
      });
    }
  }
}
