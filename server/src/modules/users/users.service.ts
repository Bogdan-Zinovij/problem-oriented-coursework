import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly entityRepository: Repository<UserEntity>,
  ) {}

  findAll(
    options: FindManyOptions<UserEntity> = { loadEagerRelations: true },
  ): Promise<UserEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.USERS_NOT_FOUND);
    });
  }

  findOne(
    conditions: FindOptionsWhere<UserEntity>,
    options: FindOneOptions<UserEntity> = { loadEagerRelations: true },
  ): Promise<UserEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.USER_NOT_FOUND);
      });
  }

  async createOne(entity: Partial<UserEntity>): Promise<UserEntity> {
    const entityToCreate = this.entityRepository.create(entity as UserEntity);
    const { id } = await this.entityRepository
      .save(entityToCreate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });

    return this.findOne({ id } as FindOptionsWhere<UserEntity>);
  }

  async updateOne(
    conditions: FindOptionsWhere<UserEntity>,
    entity: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const entityToUpdate = await this.findOne(conditions);
    const updatedEntity = this.entityRepository.merge(
      entityToUpdate,
      entity as UserEntity,
    );
    const { id } = await this.entityRepository.save(updatedEntity).catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    });
    return this.findOne({ id } as FindOptionsWhere<UserEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: false,
    });

    return this.entityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.USER_NOT_FOUND);
    });
  }
}
