import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { RedisService } from '@libs/common/src';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['x-idempotency-key'];
    if (!idempotencyKey) {
      return next.handle();
    }

    const redisKey = `idempotency:${idempotencyKey}`;
    
    // Attempt atomic lock acquisition (active for 60s max to prevent deadlocks)
    const acquired = await this.redisService.setnx(redisKey, 'in-progress', 60);

    if (acquired === 0) {
      const status = await this.redisService.get(redisKey);
      
      if (status === 'in-progress') {
        throw new ConflictException(
          'A duplicate request with the same idempotency key is already in progress.',
        );
      }
      
      if (status) {
        try {
          return of(JSON.parse(status));
        } catch (err) {
          return next.handle();
        }
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Cache response for 1 hour
        const serialized = JSON.stringify(response);
        await this.redisService.set(redisKey, serialized, 3600);
      }),
      catchError((error) => {
        // Clear lock on failure to allow immediate retries
        this.redisService.del(redisKey).catch(() => {});
        return throwError(() => error);
      }),
    );
  }
}
