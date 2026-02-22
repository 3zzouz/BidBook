import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Bid } from 'src/bids/entities/bid.entity';
import { CommonEntity } from 'src/Common/Common.entity';
  
@Entity()
export class Transaction extends CommonEntity {
  @Column({ nullable: true, type: 'varchar' })
  stripePaymentIntentId: string;

  @Column({ nullable: true, type: 'decimal' })
  amount: number;

  @Column({ nullable: true, type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'succeeded' | 'failed';

  @ManyToOne(() => Bid, (bid) => bid.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  bid: Bid;

  @Column({ type: 'timestamp', nullable: true })
  completionDate: Date;
}