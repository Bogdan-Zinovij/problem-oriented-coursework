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
import { LocationEntity } from '../locations/location.entity';

@Entity({ name: 'regions' })
export class RegionEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string' })
  @Column({ length: 64, unique: true, nullable: false })
  name: string;

  @ApiProperty({ type: 'string', uniqueItems: true })
  @Column({ length: 5, unique: true, nullable: false })
  geocode: string;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @ApiHideProperty()
  @OneToMany(() => LocationEntity, ({ region }) => region, {
    nullable: true,
  })
  locations: LocationEntity[];
}
