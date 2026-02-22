import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { CommonEntity } from 'src/Common/Common.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { Message } from 'src/conversation/entities/message.entity';

@Entity()
export class Conversation extends CommonEntity {
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @OneToOne(() => Bid)
  @JoinColumn()
  bid: Bid;

  @OneToMany(() => Message, message => message.conversation, { cascade: true })
  messages: Message[];
}