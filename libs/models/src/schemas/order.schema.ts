import { AbstractDocument } from '@libs/common/src/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    versionKey: false,
  },
})
export class Order extends AbstractDocument {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  productId!: string;

  @Prop({ type: Number, required: true, default: 1 })
  quantity!: number;

  @Prop({ type: Number, required: true })
  totalAmount!: number;

  @Prop({ type: String, required: true, default: 'PENDING_PAYMENT' })
  status!: string; // PENDING_PAYMENT, PAID, CANCELLED
}

export const OrderSchema = SchemaFactory.createForClass(Order);
