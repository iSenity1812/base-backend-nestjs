import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { Observable } from 'rxjs/dist/types';

@Injectable()
export class LoggingCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(LoggingCacheInterceptor.name);

  async intercept(context: ExecutionContext, next: any): Promise<any> {
    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Handling request: ${request.method} ${request.url}`);

    const cachedReponse = await this.cacheManager.get(request.url);
    if (cachedReponse) {
      this.logger.debug(
        `Cache hit for request: ${request.method} ${request.url}`,
      );
    } else {
      this.logger.debug(
        `Cache miss for request: ${request.method} ${request.url}`,
      );
    }
    return super.intercept(context, next);
  }
}
