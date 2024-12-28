import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LocationEntity } from './location.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';
import { CreateLocationDto } from './dto';
import { RegionsService } from '../regions/regions.service';

@Injectable()
export class LocationsService {
  constructor(
    private readonly regionsService: RegionsService,
    @InjectRepository(LocationEntity)
    private readonly entityRepository: Repository<LocationEntity>,
  ) {}

  findAll(
    options: FindManyOptions<LocationEntity> = { loadEagerRelations: true },
  ): Promise<LocationEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.LOCATIONS_NOT_FOUND);
    });
  }

  findOne(
    conditions: FindOptionsWhere<LocationEntity>,
    options: FindOneOptions<LocationEntity> = { loadEagerRelations: true },
  ): Promise<LocationEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.LOCATION_NOT_FOUND);
      });
  }

  async createOne(entity: CreateLocationDto): Promise<LocationEntity> {
    const region = await this.regionsService.findOne({
      geocode: entity.geocode,
    });

    const entityToCreate = this.entityRepository.create({
      ...entity,
      region: { id: region.id },
    });

    const { id } = await this.entityRepository
      .save(entityToCreate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id } as FindOptionsWhere<LocationEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<LocationEntity>,
  ): Promise<LocationEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: false,
    });

    return this.entityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.LOCATION_NOT_FOUND);
    });
  }
}
