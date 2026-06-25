import { AbstractDocument } from '@libs/common/src/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

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
export class Payment extends AbstractDocument {
  @Prop({ type: String, required: true })
  orderId!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, required: true })
  status!: string; // SUCCESS, FAILED

  @Prop({ type: String, required: true })
  transactionId!: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
