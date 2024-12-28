import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RefreshTokenEntity } from './refresh-token.entity';
import * as ms from 'ms';
import { AppConfigService } from 'src/config/app-config.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';
import { MAX_USER_SESSIONS_QUANTITY } from 'src/common/constants';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly entityRepository: Repository<RefreshTokenEntity>,
    private readonly appConfigService: AppConfigService,
    private readonly usersService: UsersService,
  ) {}

  findAll(
    options: FindManyOptions<RefreshTokenEntity> = { loadEagerRelations: true },
  ): Promise<RefreshTokenEntity[]> {
    return this.entityRepository.find(options).catch(() => {
      throw new NotFoundException(
        AppErrorMessagesEnum.REFRESH_TOKENS_NOT_FOUND,
      );
    });
  }

  findOne(
    conditions: FindOptionsWhere<RefreshTokenEntity>,
    options: FindOneOptions<RefreshTokenEntity> = { loadEagerRelations: true },
  ): Promise<RefreshTokenEntity> {
    return this.entityRepository
      .findOneOrFail({
        ...options,
        where: conditions,
      })
      .catch(() => {
        throw new NotFoundException(
          AppErrorMessagesEnum.REFRESH_TOKEN_NOT_FOUND,
        );
      });
  }

  async createOne(
    entity: Partial<RefreshTokenEntity>,
  ): Promise<RefreshTokenEntity> {
    const entityToCreate = this.entityRepository.create(
      entity as RefreshTokenEntity,
    );
    const { id } = await this.entityRepository
      .save(entityToCreate)
      .catch(() => {
        throw new BadRequestException(
          AppErrorMessagesEnum.INVALID_REQUEST_DATA,
        );
      });
    return this.findOne({ id } as FindOptionsWhere<RefreshTokenEntity>);
  }

  async updateOne(
    conditions: FindOptionsWhere<RefreshTokenEntity>,
    entity: Partial<RefreshTokenEntity>,
  ): Promise<RefreshTokenEntity> {
    const entityToUpdate = await this.findOne(conditions);
    const updatedEntity = this.entityRepository.merge(
      entityToUpdate,
      entity as RefreshTokenEntity,
    );
    const { id } = await this.entityRepository.save(updatedEntity).catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.INVALID_REQUEST_DATA);
    });
    return this.findOne({ id } as FindOptionsWhere<RefreshTokenEntity>);
  }

  async deleteOne(
    conditions: FindOptionsWhere<RefreshTokenEntity>,
  ): Promise<RefreshTokenEntity> {
    const entity = await this.findOne(conditions, {
      loadEagerRelations: false,
    });

    return this.entityRepository.remove(entity).catch(() => {
      throw new NotFoundException(AppErrorMessagesEnum.REFRESH_TOKEN_NOT_FOUND);
    });
  }

  async createRefreshToken(
    condition: FindOptionsWhere<UserEntity>,
    tokenData: Partial<RefreshTokenEntity>,
  ): Promise<RefreshTokenEntity> {
    const user = await this.usersService.findOne(condition);

    const tokenLifetime = this.appConfigService.get('JWT_REFRESH_EXPIRES_IN');
    const tokenDuration = ms(tokenLifetime);
    const currentDateTime = new Date();
    const expiresAt = new Date(currentDateTime.getTime() + tokenDuration);

    const refreshTokenModel: Partial<RefreshTokenEntity> = {
      user,
      ...tokenData,
      expiresAt,
    };

    return this.createOne(refreshTokenModel);
  }

  async deleteExceededRefreshTokens(
    condition: FindOptionsWhere<RefreshTokenEntity>,
  ) {
    const exceededTokens = await this.entityRepository.find({
      where: condition,
      order: {
        createdAt: 'DESC',
      },
      skip: MAX_USER_SESSIONS_QUANTITY,
    });

    const tokenIdsToDelete = exceededTokens.map((token) => token.id);
    if (tokenIdsToDelete.length) {
      await this.entityRepository.delete(tokenIdsToDelete);
    }
  }
}
