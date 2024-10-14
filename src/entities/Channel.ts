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

  @Column({ default: 150 })
  maxSummaryLength!: number;

  @Column({ default: 'daily' })
  summaryFrequency!: string;

  @Column({ default: false })
  includeHashtags!: boolean;

  @Column({ default: false })
  includeUserMentions!: boolean;

  @ManyToOne(() => User, user => user.channels)
  user!: User;
}
