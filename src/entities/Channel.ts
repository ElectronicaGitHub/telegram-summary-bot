import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  channelId!: string;

  @Column()
  channelName!: string;

  @ManyToOne(() => User, user => user.channels)
  user!: User;
}
