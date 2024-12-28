import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TopicEntity } from './topic.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly entityRepository: Repository<TopicEntity>,
  ) {}

  findAll(
    options: FindManyOptions<TopicEntity> = { loadEagerRelations: true },
  ): Promise<TopicEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.TOPICS_NOT_FOUND);
    });
  }

  findOne(
    conditions: FindOptionsWhere<TopicEntity>,
    options: FindOneOptions<TopicEntity> = { loadEagerRelations: true },
  ): Promise<TopicEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.TOPIC_NOT_FOUND);
      });
  }

  async createOne(entity: Partial<TopicEntity>): Promise<TopicEntity> {
    const entityToCreate = this.entityRepository.create(entity as TopicEntity);
    const { id } = await this.entityRepository
      .save(entityToCreate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id } as FindOptionsWhere<TopicEntity>);
  }

  async updateOne(
    conditions: FindOptionsWhere<TopicEntity>,
    entity: Partial<TopicEntity>,
  ): Promise<TopicEntity> {
    const entityToUpdate = await this.findOne(conditions);
    const updatedEntity = this.entityRepository.merge(
      entityToUpdate,
      entity as TopicEntity,
    );
    const { id } = await this.entityRepository.save(updatedEntity).catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    });
    return this.findOne({ id } as FindOptionsWhere<TopicEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<TopicEntity>,
  ): Promise<TopicEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: false,
    });

    return this.entityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.TOPIC_NOT_FOUND);
    });
  }
}
