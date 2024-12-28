import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, FindOneOptions, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LikeEntity } from './like.entity';
import { CreateCommentLikeDto, CreateInitiativeLikeDto } from './dto';
import { IdParameterDto } from 'src/common/dto';
import { AppErrorMessagesEnum } from 'src/common/enums';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
  ) {}

  findCommentLike(
    conditions: FindOptionsWhere<LikeEntity>,
    options: FindOneOptions<LikeEntity> = { loadEagerRelations: true },
  ): Promise<LikeEntity> {
    return this.likeRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(
          AppErrorMessagesEnum.COMMENT_LIKE_NOT_FOUND,
        );
      });
  }

  async createCommentLike(entity: CreateCommentLikeDto): Promise<LikeEntity> {
    const { userId, commentId } = entity;

    const likeInDb = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        comments: { id: commentId },
      },
      relations: ['user', 'comments'],
    });

    if (!likeInDb) {
      const like = this.likeRepository.create({
        user: { id: userId },
        comments: [{ id: commentId }],
      });

      try {
        return await this.likeRepository.save(like);
      } catch (error) {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      }
    } else {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }
  }

  async deleteCommentLike(
    conditions: FindOptionsWhere<LikeEntity>,
  ): Promise<LikeEntity> {
    const entity = await this.findCommentLike(conditions, {
      loadEagerRelations: false,
    });

    return this.likeRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.COMMENT_LIKE_NOT_FOUND);
    });
  }

  async countLikesByCommentId(IdParameterDto: IdParameterDto): Promise<number> {
    try {
      const count = await this.likeRepository.count({
        where: {
          comments: { id: IdParameterDto.id },
        },
      });

      return count;
    } catch (error) {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }
  }

  findInitiativeLike(
    conditions: FindOptionsWhere<LikeEntity>,
    options: FindOneOptions<LikeEntity> = { loadEagerRelations: true },
  ): Promise<LikeEntity> {
    return this.likeRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(
          AppErrorMessagesEnum.INITIATIVE_LIKE_NOT_FOUND,
        );
      });
  }

  async createInitiativeLike(
    entity: CreateInitiativeLikeDto,
  ): Promise<LikeEntity> {
    const { userId, initiativeId } = entity;

    const likeInDb = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        initiatives: { id: initiativeId },
      },
      relations: ['user', 'initiatives'],
    });

    if (!likeInDb) {
      const like = this.likeRepository.create({
        user: { id: userId },
        initiatives: [{ id: initiativeId }],
      });

      try {
        return await this.likeRepository.save(like);
      } catch (error) {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      }
    } else {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }
  }

  async deleteInitiativeLike(
    conditions: FindOptionsWhere<LikeEntity>,
  ): Promise<LikeEntity> {
    const entity = await this.findInitiativeLike(conditions, {
      loadEagerRelations: false,
    });

    return this.likeRepository.remove(entity).catch(() => {
      throw new NotFoundException(
        AppErrorMessagesEnum.INITIATIVE_LIKE_NOT_FOUND,
      );
    });
  }

  async countLikesByInitiativeId(id: string): Promise<number> {
    try {
      const count = await this.likeRepository.count({
        where: {
          initiatives: { id },
        },
      });
      return count;
    } catch (error) {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }
  }
}
