import { HEALTH_CHECK } from '@app/common/constants';
import { getConfig } from '@app/common/utils/config';
import { Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthIndicatorFunction,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { StatusHealthCheckResponse } from './types';

@Injectable()
export class HealthService {
  constructor(
    private readonly http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
  ) {}

  getHealthChecks(): HealthIndicatorFunction[] {
    const healthChecks: HealthIndicatorFunction[] = [];

    if (getConfig('core.healthCheck.memory.enableHeapCheck')) {
      const heapThreshold = getConfig('core.healthCheck.memory.heapThreshold');
      healthChecks.push(async () =>
        this.memory.checkHeap(HEALTH_CHECK.MEMORY_HEAP, heapThreshold),
      );
    }

    if (getConfig('core.healthCheck.memory.enableRssCheck')) {
      const rssThreshold = getConfig('core.healthCheck.memory.rssThreshold');
      healthChecks.push(async () =>
        this.memory.checkRSS(HEALTH_CHECK.MEMORY_RSS, rssThreshold),
      );
    }

    if (getConfig('core.healthCheck.disk.enable')) {
      const path = getConfig('core.healthCheck.disk.path');
      const thresholdPercent = getConfig(
        'core.healthCheck.disk.thresholdPercent',
      );
      healthChecks.push(async () =>
        this.disk.checkStorage(HEALTH_CHECK.DISK, {
          path,
          thresholdPercent,
        }),
      );
    }

    if (getConfig('core.healthCheck.database.enable')) {
      healthChecks.push(async () => this.db.pingCheck(HEALTH_CHECK.DATABASE));
    }

    if (getConfig('core.healthCheck.http.enable')) {
      const url = getConfig('core.healthCheck.http.url');
      healthChecks.push(async () =>
        this.http.pingCheck(HEALTH_CHECK.DATABASE, url),
      );
    }

    return healthChecks;
  }
  async getMicroserviceHealthCheck(): Promise<StatusHealthCheckResponse[]> {
    const result = [];
    if (getConfig('core.healthCheck.microservice.enable')) {
      const iterableMicroservices = getConfig('core.gateway.services');

      for (const [key, value] of Object.entries(iterableMicroservices)) {
        if (value === Object(value)) {
          const capturedKey = key;
          const payload = getConfig(`core.gateway.services.${capturedKey}`);

          const pingResult = await this.microservice
            .pingCheck(`${HEALTH_CHECK.MICROSERVICE}${capturedKey}`, {
              ...payload,
            })
            .then((res) => {
              return res;
            })
            .catch((err) => {
              return err.causes;
            });
          result.push(pingResult);
        }
      }
    }
    return result;
  }
}
