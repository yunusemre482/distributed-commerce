import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    let traceparent = req.headers['traceparent'] || req.headers['x-correlation-id'];
    
    if (!traceparent) {
      const traceId = randomBytes(16).toString('hex');
      const spanId = randomBytes(8).toString('hex');
      traceparent = `00-${traceId}-${spanId}-01`;
    }

    req.headers['traceparent'] = traceparent;
    req.headers['x-correlation-id'] = traceparent.split('-')[1];

    if (res.setHeader) {
      res.setHeader('traceparent', traceparent);
      res.setHeader('x-correlation-id', req.headers['x-correlation-id']);
    }

    next();
  }
}
