import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { LocationEntity } from '../locations/location.entity';
import { TopicEntity } from '../topics/topic.entity';
import { CommentEntity } from '../comments/comment.entity';
import { UserEntity } from '../users/user.entity';
import { ImageEntity } from '../images/image.entity';
import { InitiativeStatusEnum } from 'src/common/enums';
import { LikeEntity } from '../likes/like.entity';

@Entity({ name: 'initiatives' })
export class InitiativeEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string' })
  @Column({ length: 128 })
  title: string;

  @ApiProperty({ type: 'string' })
  @Column({ length: 512 })
  description: string;

  @ApiProperty({
    enum: InitiativeStatusEnum,
    default: InitiativeStatusEnum.CREATED,
  })
  @Column({
    enum: InitiativeStatusEnum,
    default: InitiativeStatusEnum.CREATED,
    nullable: false,
  })
  status: InitiativeStatusEnum;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @ApiProperty({ type: () => LocationEntity })
  @OneToOne(() => LocationEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  location: Partial<LocationEntity>;

  @ApiProperty({ type: () => TopicEntity })
  @ManyToOne(() => TopicEntity, ({ initiatives }) => initiatives, {
    eager: true,
  })
  @JoinColumn()
  topic: TopicEntity;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, ({ initiatives }) => initiatives, {
    eager: true,
  })
  @JoinColumn()
  user: UserEntity;

  @ApiHideProperty()
  @OneToMany(() => CommentEntity, ({ initiative }) => initiative)
  comments: CommentEntity[];

  @ApiProperty({ type: () => ImageEntity, isArray: true })
  @ManyToMany(() => ImageEntity, ({ initiatives }) => initiatives)
  images: ImageEntity[];

  @ApiProperty({ type: () => LikeEntity, isArray: true })
  @ManyToMany(() => LikeEntity, ({ initiatives }) => initiatives, {
    cascade: true, // Ensure likes are removed when the initiative is removed
  })
  likes: LikeEntity[];
}
