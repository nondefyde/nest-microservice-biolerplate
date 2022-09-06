import { BeforeInsert, Column, CreateDateColumn, Entity } from 'typeorm';
import { BaseEntity } from 'finfrac/core/shared';

export enum TransactionType {
  BANK_TRANSFER = 'bank-transfer',
  WALLET_TRANSFER = 'wallet-transfer',
  LOAN_TRANSFER = 'loan-transfer',
  LOAN_PAYMENT = 'loan-payment',
}

@Entity()
export class Transaction extends BaseEntity<Transaction> {
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.BANK_TRANSFER,
  })
  type: TransactionType;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @Column({ type: 'float', default: 0 })
  amount: any;

  @Column({ type: 'float', default: 0 })
  fee: any;

  @Column({ type: 'varchar', default: 'NGN' })
  currency: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
  paidAt: Date;

  @Column({ type: 'varchar', nullable: true })
  narration: string;

  @Column()
  reference: string;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  data: any;

  @BeforeInsert()
  protected beforeInserthashPassword() {
    this.email = this.email.toLowerCase();
  }

  public static config() {
    return {
      idToken: 'trx',
      uniques: ['mobile'],
      fillables: ['name', 'email', 'mobile'],
      updateFillables: ['name', 'email', 'mobile'],
      dateFilters: ['paidAt', 'createdAt', 'updatedAt'],
      hiddenFields: ['deleted'],
    };
  }
}
