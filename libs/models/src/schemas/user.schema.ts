
import { AbstractDocument } from '@libs/common/src/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (doc, ret: Record<string, any>) => {
      ret.id = ret._id;

      delete ret._id;
      delete ret.password;

      return ret;
    },
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret: Record<string, any>) => {
      delete ret.password;
      return ret;
    },
  },
})
export class User extends AbstractDocument {

  @Prop({ type: String, required: true })
  username!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String, required: true })
  role!: string;

  @Prop({ type: String, required: true })
  status!: string;

  @Prop({ type: String, required: true })
  firstName!: string;

  @Prop({ type: String, required: true })
  lastName!: string;

  @Prop({ type: String, required: true })
  phone!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
