import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { CommentEntity } from '../comments/comment.entity';
import { InitiativeEntity } from '../initiatives/initiative.entity';

@Entity({ name: 'likes' })
export class LikeEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, ({ likes }) => likes)
  @JoinColumn()
  user: UserEntity;

  @ApiProperty({ type: () => InitiativeEntity, isArray: true })
  @ManyToMany(() => InitiativeEntity, ({ likes }) => likes)
  @JoinTable({ name: 'initiatives-likes' })
  initiatives: InitiativeEntity[];

  @ApiProperty({ type: () => CommentEntity, isArray: true })
  @ManyToMany(() => CommentEntity, ({ likes }) => likes)
  @JoinTable({ name: 'comments-likes' })
  comments: CommentEntity[];
}
