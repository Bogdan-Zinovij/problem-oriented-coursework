import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InitiativeEntity } from '../initiatives/initiative.entity';

@Entity({ name: 'topics' })
export class TopicEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string' })
  @Column({ length: 64, unique: true, nullable: false })
  name: string;

  @ApiProperty({ type: 'string' })
  @Column({ length: 512 })
  description: string;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @ApiHideProperty()
  @OneToMany(() => InitiativeEntity, ({ topic }) => topic, {
    nullable: true,
  })
  initiatives: InitiativeEntity[];
}
