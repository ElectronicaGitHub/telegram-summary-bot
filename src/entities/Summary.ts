import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Summary {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  channelName!: string;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, user => user.summaries)
  user!: User;
}
