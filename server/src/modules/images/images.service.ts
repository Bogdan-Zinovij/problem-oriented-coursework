import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { ImageEntity } from './image.entity';
import { StorageService } from 'src/systems/storage/storage.service';
import { STORAGE_ROOT_DIRECTORY } from 'src/systems/storage/storage.constants';
import { InitiativeEntity } from '../initiatives/initiative.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';
import { imagesMimetypes } from 'src/common/constants';
import { CommentEntity } from '../comments/comment.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageEntityRepository: Repository<ImageEntity>,
    private readonly storageService: StorageService,
  ) {}

  async createOne(
    file: Express.Multer.File,
    data?: Partial<ImageEntity>,
    pathToFile = STORAGE_ROOT_DIRECTORY,
  ) {
    if (!imagesMimetypes.includes(file.mimetype)) {
      throw new BadRequestException(AppErrorMessagesEnum.IMAGE_UNACCEPTED_TYPE);
    }

    console.log(file);

    const uploadedFileEntity = await this.storageService.createOne(
      file,
      pathToFile,
    );
    const entityLike = this.imageEntityRepository.create(uploadedFileEntity);
    const entityToCreate = this.imageEntityRepository.merge(entityLike, data);
    const { id } = await this.imageEntityRepository
      .save(entityToCreate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id });
  }

  async linkImageToInitiative(
    conditions: FindOptionsWhere<ImageEntity>,
    initiativeEntity: InitiativeEntity,
  ): Promise<ImageEntity> {
    const entityToUpdate = await this.findOne(conditions);
    entityToUpdate.initiatives = [initiativeEntity];

    const { id } = await this.imageEntityRepository
      .save(entityToUpdate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id } as FindOptionsWhere<ImageEntity>);
  }

  async linkImageToComment(
    conditions: FindOptionsWhere<ImageEntity>,
    commentEntity: CommentEntity,
  ): Promise<ImageEntity> {
    const entityToUpdate = await this.findOne(conditions);
    entityToUpdate.comments = [commentEntity];

    const { id } = await this.imageEntityRepository
      .save(entityToUpdate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id } as FindOptionsWhere<ImageEntity>);
  }

  findOne(
    conditions: FindOptionsWhere<ImageEntity>,
    options: FindOneOptions<ImageEntity> = { loadEagerRelations: true },
  ): Promise<ImageEntity> {
    return this.imageEntityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(AppErrorMessagesEnum.IMAGE_NOT_FOUND);
      });
  }

  findAll(
    options: FindManyOptions<ImageEntity> = { loadEagerRelations: true },
  ): Promise<ImageEntity[]> {
    return this.imageEntityRepository.find(options).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.IMAGES_NOT_FOUND);
    });
  }

  getInitiativeImages(
    conditions: FindOptionsWhere<ImageEntity>,
    options: FindManyOptions<ImageEntity> = { loadEagerRelations: true },
  ): Promise<ImageEntity[]> {
    return this.imageEntityRepository
      .find({
        ...options,
        where: conditions,
      })
      .catch(() => {
        return [];
      });
  }

  async deleteOne(
    conditions: FindOptionsWhere<ImageEntity>,
  ): Promise<ImageEntity> {
    const entity = await this.findOne(conditions);
    await this.storageService.deleteOne(entity.filePath);
    return this.imageEntityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.IMAGE_NOT_FOUND);
    });
  }
}
