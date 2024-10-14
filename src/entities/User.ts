import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Channel } from './Channel';
import { Summary } from './Summary';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  telegramId!: string;

  @Column()
  chatId!: string;

  @OneToMany(() => Channel, channel => channel.user)
  channels!: Channel[];

  @OneToMany(() => Summary, summary => summary.user)
  summaries!: Summary[];
}
