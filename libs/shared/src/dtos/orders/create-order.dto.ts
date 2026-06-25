import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
