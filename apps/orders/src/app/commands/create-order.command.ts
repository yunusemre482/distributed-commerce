import { CreateOrderDTO } from '@libs/shared/src';

export class CreateOrderCommand {
  constructor(public readonly dto: CreateOrderDTO) {}
}
