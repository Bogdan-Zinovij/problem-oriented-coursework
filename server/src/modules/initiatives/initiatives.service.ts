import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InitiativeEntity } from './initiative.entity';
import { ChangeStatusDto, CreateInitiativeDto, CustomSearchDto } from './dto';
import { LocationsService } from '../locations/locations.service';
import { AppErrorMessagesEnum, InitiativeStatusEnum } from 'src/common/enums';
import { ImagesService } from '../images/images.service';
import { ImageEntity } from '../images/image.entity';
import { LikesService } from '../likes/likes.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class InitiativesService {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly locationsService: LocationsService,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
    @InjectRepository(InitiativeEntity)
    private readonly entityRepository: Repository<InitiativeEntity>,
  ) {}

  findAll(
    options: FindManyOptions<InitiativeEntity> = { loadEagerRelations: true },
  ): Promise<InitiativeEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.INITIATIVES_NOT_FOUND);
    });
  }

  findOne(
    conditions: FindOptionsWhere<InitiativeEntity>,
    options: FindOneOptions<InitiativeEntity> = { loadEagerRelations: true },
  ): Promise<InitiativeEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.INITIATIVE_NOT_FOUND);
      });
  }

  getUsersInitiatives(
    conditions: FindOptionsWhere<InitiativeEntity>,
    options: FindManyOptions<InitiativeEntity> = { loadEagerRelations: true },
  ): Promise<InitiativeEntity[]> {
    return this.entityRepository
      .find({ ...options, where: { user: conditions } })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.INITIATIVES_NOT_FOUND);
      });
  }

  async findByCustomSearch(
    params: CustomSearchDto,
  ): Promise<InitiativeEntity[]> {
    try {
      const queryBuilder =
        this.entityRepository.createQueryBuilder('initiative');

      if (params.title) {
        queryBuilder.where('LOWER(initiative.title) LIKE LOWER(:title)', {
          title: `%${params.title}%`,
        });
      }

      if (params.createdAtStart || params.createdAtEnd) {
        queryBuilder.andWhere(
          params.createdAtStart && params.createdAtEnd
            ? 'initiative.createdAt BETWEEN :start AND :end'
            : params.createdAtStart
            ? 'initiative.createdAt >= :start'
            : 'initiative.createdAt <= :end',
          {
            start: params.createdAtStart,
            end: params.createdAtEnd,
          },
        );
      }

      if (params.topicId) {
        queryBuilder.andWhere('initiative.topicId = :topicId', {
          topicId: params.topicId,
        });
      }

      if (params.regionId) {
        queryBuilder.andWhere('location.regionId = :regionId', {
          regionId: params.regionId,
        });
      }

      if (params.status) {
        queryBuilder.andWhere('initiative.status = :status', {
          status: params.status,
        });
      }

      queryBuilder
        .leftJoinAndSelect('initiative.user', 'user')
        .leftJoinAndSelect('initiative.topic', 'topic')
        .leftJoinAndSelect('initiative.location', 'location')
        .leftJoinAndSelect('location.region', 'region');

      const initiatives = await queryBuilder.getMany();

      return initiatives;
    } catch (error) {
      throw new NotFoundException(AppErrorMessagesEnum.INITIATIVES_NOT_FOUND);
    }
  }

  async createOne(entity: CreateInitiativeDto): Promise<InitiativeEntity> {
    const { userId, topicId, location, imageId } = entity;

    const createdLocation = await this.locationsService.createOne(location);

    const initiative = this.entityRepository.create({
      ...entity,
      user: { id: userId },
      location: { id: createdLocation.id },
      topic: { id: topicId },
    });

    const createdInitiative = await this.entityRepository.save(initiative);

    if (imageId) {
      this.addImage({ id: imageId }, createdInitiative);
    }

    try {
      return createdInitiative;
    } catch (error) {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }
  }

  async updateOne(
    conditions: FindOptionsWhere<InitiativeEntity>,
    entity: Partial<InitiativeEntity>,
  ): Promise<InitiativeEntity> {
    const entityToUpdate = await this.findOne(conditions);
    const updatedEntity = this.entityRepository.merge(
      entityToUpdate,
      entity as InitiativeEntity,
    );

    const { id } = await this.entityRepository.save(updatedEntity).catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    });

    return this.findOne({ id } as FindOptionsWhere<InitiativeEntity>);
  }

  async changeStatus(
    conditions: FindOptionsWhere<InitiativeEntity>,
    changeStatusDto: Partial<ChangeStatusDto>,
  ): Promise<InitiativeEntity> {
    if (!Object.values(InitiativeStatusEnum).includes(changeStatusDto.status)) {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    }

    const entityToUpdate = await this.findOne(conditions);
    const updatedEntity = this.entityRepository.merge(
      entityToUpdate,
      changeStatusDto as InitiativeEntity,
    );

    const { id } = await this.entityRepository.save(updatedEntity).catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    });

    return this.findOne({ id } as FindOptionsWhere<InitiativeEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<InitiativeEntity>,
  ): Promise<InitiativeEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: true,
    });

    if (!entity) {
      throw new NotFoundException(AppErrorMessagesEnum.INITIATIVE_NOT_FOUND);
    }

    const initiativeComments = await this.commentsService.getInitiativeComments(
      { initiative: { id: conditions.id } },
    );

    const initiativeImages = await this.imagesService.getInitiativeImages({
      initiatives: { id: conditions.id },
    });

    if (initiativeComments.length) {
      const deleteCommentPromises = initiativeComments.map((comment) =>
        this.commentsService.deleteOne({ id: comment.id }),
      );

      await Promise.all([...deleteCommentPromises]);
    }

    if (initiativeImages) {
      const deleteImagePromises = initiativeImages.map((image) =>
        this.imagesService.deleteOne({ id: image.id }),
      );

      await Promise.all([...deleteImagePromises]);
    }

    return this.entityRepository.remove(entity).catch((err) => {
      console.log(err);
      throw new NotFoundException(AppErrorMessagesEnum.INITIATIVE_NOT_FOUND);
    });
  }

  async getMostLiked(
    options: FindManyOptions<InitiativeEntity> = {},
  ): Promise<InitiativeEntity[]> {
    try {
      const initiatives = await this.entityRepository.find(options);

      const likesCountsMap = new Map<string, number>();

      await Promise.all(
        initiatives.map(async (initiative) => {
          const likesCount = await this.likesService.countLikesByInitiativeId(
            initiative.id,
          );
          likesCountsMap.set(initiative.id, likesCount);
        }),
      );

      initiatives.sort((a, b) => {
        const likesCountA = likesCountsMap.get(a.id) || 0;
        const likesCountB = likesCountsMap.get(b.id) || 0;
        return likesCountB - likesCountA;
      });

      const INITIATIVES_NUMBER = 10;
      const mostLikedInitiatives = initiatives.slice(0, INITIATIVES_NUMBER);

      return mostLikedInitiatives;
    } catch (error) {
      throw new NotFoundException(AppErrorMessagesEnum.INITIATIVES_NOT_FOUND);
    }
  }

  async addImage(
    conditions: FindOptionsWhere<ImageEntity>,
    initiative: InitiativeEntity,
  ): Promise<ImageEntity> {
    return this.imagesService.linkImageToInitiative(conditions, initiative);
  }

  async getMonthStatistics() {
    try {
      const date = new Date();
      date.setMonth(date.getMonth() - 1); // Віднімаємо 1 місяць від поточної дати

      // Кількість ініціатив за кожним статусом за останній місяць
      const statusCounts = await this.entityRepository
        .createQueryBuilder('initiative')
        .select('status')
        .addSelect('COUNT(*) as count')
        .where('initiative.createdAt >= :date', { date }) // Обмеження за датою
        .groupBy('status')
        .getRawMany();

      // Топ 4 найпопулярніші теми за останній місяць
      const topThemes = await this.entityRepository
        .createQueryBuilder('initiative')
        .select('topic.name')
        .addSelect('COUNT(*) as count')
        .innerJoin('initiative.topic', 'topic')
        .where('initiative.createdAt >= :date', { date }) // Обмеження за датою
        .groupBy('topic.name')
        .orderBy('count', 'DESC')
        .limit(4)
        .getRawMany();

      // Топ 5 міст з найбільшою кількістю звернень за останній місяць
      const topCities = await this.entityRepository
        .createQueryBuilder('initiative')
        .select('region.name')
        .addSelect('COUNT(*) as count')
        .innerJoin('initiative.location', 'location')
        .innerJoin('location.region', 'region')
        .where('initiative.createdAt >= :date', { date }) // Обмеження за датою
        .groupBy('region.name')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();

      return { statusCounts, topThemes, topCities };
    } catch (error) {
      throw new NotFoundException(AppErrorMessagesEnum.INITIATIVES_NOT_FOUND);
    }
  }
}
