import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto';
import { AppErrorMessagesEnum } from 'src/common/enums';
import { ImageEntity } from '../images/image.entity';
import { ImagesService } from '../images/images.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly imagesService: ImagesService,
    @InjectRepository(CommentEntity)
    private readonly entityRepository: Repository<CommentEntity>,
  ) {}

  findAll(
    options: FindManyOptions<CommentEntity> = { loadEagerRelations: true },
  ): Promise<CommentEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.COMMENTS_NOT_FOUND);
    });
  }

  findOne(
    conditions: FindOptionsWhere<CommentEntity>,
    options: FindOneOptions<CommentEntity> = { loadEagerRelations: true },
  ): Promise<CommentEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.COMMENT_NOT_FOUND);
      });
  }

  getInitiativeComments(
    conditions: FindOptionsWhere<CommentEntity>,
    options: FindManyOptions<CommentEntity> = { loadEagerRelations: true },
  ): Promise<CommentEntity[]> {
    return this.entityRepository
      .find({
        ...options,
        where: conditions,
      })
      .catch(() => {
        return [];
      });
  }

  async createOne(entity: CreateCommentDto): Promise<CommentEntity> {
    const { userId, initiativeId, imageId } = entity;

    const comment = this.entityRepository.create({
      ...entity,
      user: { id: userId },
      initiative: { id: initiativeId },
    });

    try {
      const createdComment = await this.entityRepository.save(comment);
      if (imageId) {
        await this.addImage({ id: imageId }, createdComment);
      }

      return this.findOne({ id: createdComment.id });
    } catch (error) {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }
  }

  async updateOne(
    conditions: FindOptionsWhere<CommentEntity>,
    entity: Partial<CommentEntity>,
  ): Promise<CommentEntity> {
    const entityToUpdate = await this.findOne(conditions);
    const updatedEntity = this.entityRepository.merge(
      entityToUpdate,
      entity as CommentEntity,
    );
    const { id } = await this.entityRepository.save(updatedEntity).catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    });

    return this.findOne({ id } as FindOptionsWhere<CommentEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<CommentEntity>,
  ): Promise<CommentEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: true,
    });

    if (!entity) {
      throw new NotFoundException(AppErrorMessagesEnum.COMMENT_NOT_FOUND);
    }

    console.log(entity);

    if (entity.images.length) {
      const deleteImagePromises = entity.images.map((image) =>
        this.imagesService.deleteOne({ id: image.id }),
      );

      await Promise.all(deleteImagePromises);
    }

    return this.entityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.COMMENT_NOT_FOUND);
    });
  }

  async addImage(
    conditions: FindOptionsWhere<ImageEntity>,
    comment: CommentEntity,
  ): Promise<ImageEntity> {
    return this.imagesService.linkImageToComment(conditions, comment);
  }
}
