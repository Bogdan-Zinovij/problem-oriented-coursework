import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from 'src/common/enums';
import { SALT_ROUNDS } from 'src/common/constants';
import { CommentEntity } from '../comments/comment.entity';
import { InitiativeEntity } from '../initiatives/initiative.entity';
import { LikeEntity } from '../likes/like.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', maxLength: 32 })
  @Column({ length: 32, nullable: false })
  name: string;

  @ApiProperty({ type: 'string', maxLength: 32 })
  @Column({ length: 32, nullable: false })
  surname: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ length: 64, nullable: false })
  password: string;

  @ApiProperty({ type: 'string', maxLength: 256, uniqueItems: true })
  @Column({ length: 256, unique: true, nullable: false })
  email: string;

  @ApiProperty({ enum: UserRoleEnum, default: UserRoleEnum.USER })
  @Column({ enum: UserRoleEnum, default: UserRoleEnum.USER, nullable: false })
  role: UserRoleEnum;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
  }

  @ApiHideProperty()
  @OneToMany(() => CommentEntity, ({ user }) => user, {
    nullable: true,
  })
  comments: CommentEntity[];

  @ApiHideProperty()
  @OneToMany(() => InitiativeEntity, ({ user }) => user, {
    nullable: true,
  })
  initiatives: InitiativeEntity[];

  @ApiHideProperty()
  @OneToMany(() => LikeEntity, ({ user }) => user, {
    nullable: true,
  })
  likes: LikeEntity;
}
