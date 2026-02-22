import { Entity, Column, ManyToOne } from 'typeorm';
import { CommonEntity } from 'src/Common/Common.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message extends CommonEntity {
  @Column('text')
  content: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column('boolean')
  direction: boolean;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  conversation: Conversation;
}
