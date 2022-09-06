import { BeforeInsert, Column, Entity } from 'typeorm';
import * as _ from 'lodash';
import { BaseEntity } from 'finfrac/core/shared';

@Entity()
export class Wallet extends BaseEntity<Wallet> {
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'NGN' })
  currency: string;

  @BeforeInsert()
  protected lowerCaseEmail() {
    this.email = this.email.toLowerCase();
  }

  public static config() {
    return {
      uniques: [],
      fillables: ['amount', 'email'],
      updateFillables: ['amount', 'email'],
      hiddenFields: ['deleted'],
    };
  }

  public static searchQuery(q) {
    const query = [];
    if (_.isNumber(Number(q)) && !_.isNaN(parseInt(q))) {
      query.push({
        'amount = :q': { q: Number(q) },
      });
    }
    return [
      {
        query: 'email like :q',
        data: { q: `%${q}%` },
      },
    ];
  }
}
