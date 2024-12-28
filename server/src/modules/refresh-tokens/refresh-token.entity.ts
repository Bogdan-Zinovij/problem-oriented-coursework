import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/common/constants';

@Entity({ name: 'refresh-tokens' })
export class RefreshTokenEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', maxLength: 1024, uniqueItems: true })
  @Column({ length: 1024, unique: true })
  value: string;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @Column({ readonly: true })
  expiresAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @BeforeInsert()
  async hashRefreshToken() {
    if (this.value) {
      this.value = await bcrypt.hash(this.value, SALT_ROUNDS);
    }
  }

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
