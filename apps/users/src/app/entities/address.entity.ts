import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_addresses')
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string; // Home, Office, etc.

  @Column()
  addressLine1!: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column()
  city!: string;

  @Column()
  country!: string;

  @Column()
  zipCode!: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user!: User;
}
