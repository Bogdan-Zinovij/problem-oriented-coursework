import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegionEntity } from './region.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(RegionEntity)
    private readonly entityRepository: Repository<RegionEntity>,
  ) {}

  findAll(
    options: FindManyOptions<RegionEntity> = { loadEagerRelations: true },
  ): Promise<RegionEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.REGIONS_NOT_FOUND);
    });
  }

  findOne(
    conditions: FindOptionsWhere<RegionEntity>,
    options: FindOneOptions<RegionEntity> = { loadEagerRelations: true },
  ): Promise<RegionEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.REGION_NOT_FOUND);
      });
  }

  async createOne(entity: Partial<RegionEntity>): Promise<RegionEntity> {
    const entityToCreate = this.entityRepository.create(entity as RegionEntity);
    const { id } = await this.entityRepository
      .save(entityToCreate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id } as FindOptionsWhere<RegionEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<RegionEntity>,
  ): Promise<RegionEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: false,
    });

    return this.entityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.REGION_NOT_FOUND);
    });
  }
}
