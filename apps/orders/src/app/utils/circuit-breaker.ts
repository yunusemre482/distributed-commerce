import { Logger } from '@nestjs/common';

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastStateChanged = Date.now();
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(
    private readonly name: string,
    private readonly failureThreshold: number = 3,
    private readonly cooldownPeriodMs: number = 10000, // 10s cooldown
  ) {}

  async execute<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    this.checkState();

    if (this.state === CircuitBreakerState.OPEN) {
      this.logger.warn(`[CircuitBreaker:${this.name}] Circuit is OPEN. Fast-failing and executing fallback.`);
      return fallback();
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      return fallback();
    }
  }

  private checkState() {
    if (this.state === CircuitBreakerState.OPEN) {
      const timeSinceLastChange = Date.now() - this.lastStateChanged;
      if (timeSinceLastChange > this.cooldownPeriodMs) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.lastStateChanged = Date.now();
        this.logger.log(`[CircuitBreaker:${this.name}] Cooldown expired. Moving to HALF_OPEN.`);
      }
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
      this.lastStateChanged = Date.now();
      this.logger.log(`[CircuitBreaker:${this.name}] Success in HALF_OPEN. Closing circuit.`);
    }
  }

  private onFailure(err: any) {
    this.failureCount++;
    this.logger.error(
      `[CircuitBreaker:${this.name}] Failure count: ${this.failureCount}. Error: ${err.message || err}`
    );

    if (this.state === CircuitBreakerState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.lastStateChanged = Date.now();
      this.logger.warn(`[CircuitBreaker:${this.name}] Failure threshold reached. Opening circuit!`);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}
