import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InitiativeEntity } from '../initiatives/initiative.entity';
import { RegionEntity } from '../regions/region.entity';

@Entity({ name: 'locations' })
export class LocationEntity extends BaseEntity {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'number' })
  @Column({ type: 'double precision', nullable: false })
  latitude: number;

  @ApiProperty({ type: 'number' })
  @Column({ type: 'double precision', nullable: false })
  longitude: number;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @CreateDateColumn({ readonly: true })
  readonly createdAt: Date;

  @ApiProperty({ type: 'string', readOnly: true, format: 'date-time' })
  @UpdateDateColumn({ readonly: true })
  readonly updatedAt: Date;

  @ApiProperty({ type: () => InitiativeEntity })
  @OneToOne(() => InitiativeEntity)
  initiative: Partial<InitiativeEntity>;

  @ApiProperty({ type: () => RegionEntity })
  @ManyToOne(() => RegionEntity, ({ locations }) => locations, {
    eager: true,
  })
  @JoinColumn()
  region: RegionEntity;
}
