import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { RedisService } from '../redis/redis.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redis: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `cache:${request.method}:${request.url}`;

    return next.handle().pipe(
      tap(async (data) => {
        if (request.method === 'GET') {
          await this.redis.setJSON(cacheKey, data, 60);
        } else {
          await this.redis.del(cacheKey);
        }
      }),
    );
  }
}

