import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import * as path from 'path';
import { AppConfigService } from 'src/config/app-config.service';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { InitiativeEntity } from '../initiatives/initiative.entity';
import { CommentEntity } from '../comments/comment.entity'; // Import CommentEntity

const appConfigService = new AppConfigService(new ConfigService());

@Entity('images')
export class ImageEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', maxLength: 256, required: true })
  @Column({ type: 'varchar', length: 256 })
  fileName: string;

  @ApiProperty({ type: 'string', maxLength: 256, required: true })
  @Column({ type: 'varchar', length: 256 })
  fileExt: string;

  @ApiProperty({ type: 'string', maxLength: 512, required: true })
  @Column({ type: 'varchar', length: 512 })
  fileNameWithExt: string;

  @ApiProperty({ type: 'string', maxLength: 256, required: true })
  @Column({ type: 'varchar', length: 256 })
  mimetype: string;

  @ApiProperty({ type: 'string', maxLength: 512, required: true })
  @Column({ type: 'varchar', length: 512 })
  filePath: string;

  @Expose()
  @ApiProperty({ readOnly: true })
  get src(): string {
    if (!this.filePath) return null;
    const filePath = path
      .join(appConfigService.get('CDN'), this.filePath)
      .replace(/\\/g, '/');

    return new URL(filePath).toString();
  }

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @ApiProperty({ type: () => InitiativeEntity, isArray: true }) // Many images can belong to many initiatives
  @ManyToMany(() => InitiativeEntity, ({ images }) => images)
  @JoinTable({ name: 'initiatives-images' })
  initiatives: InitiativeEntity[];

  @ApiProperty({ type: () => CommentEntity, isArray: true }) // Many images can be associated with many comments
  @ManyToMany(() => CommentEntity, ({ images }) => images)
  @JoinTable({ name: 'comments-images' })
  comments: CommentEntity[];
}
