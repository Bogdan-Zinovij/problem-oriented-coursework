import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { InitiativeEntity } from '../initiatives/initiative.entity';
import { ImageEntity } from '../images/image.entity';
import { LikeEntity } from '../likes/like.entity';

@Entity({ name: 'comments' })
export class CommentEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string' })
  @Column({ length: 512 })
  text: string;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @ApiProperty({ type: () => LikeEntity, isArray: true })
  @ManyToMany(() => LikeEntity, ({ comments }) => comments, {
    cascade: true,
  })
  likes: LikeEntity[];

  @ApiProperty({ type: () => ImageEntity, isArray: true })
  @ManyToMany(() => ImageEntity, ({ comments }) => comments, {
    eager: true,
  })
  images: ImageEntity[];

  @ApiProperty({ type: () => InitiativeEntity })
  @ManyToOne(() => InitiativeEntity, ({ comments }) => comments)
  @JoinColumn()
  initiative: InitiativeEntity;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, ({ comments }) => comments, {
    eager: true,
  })
  @JoinColumn()
  user: UserEntity;
}
