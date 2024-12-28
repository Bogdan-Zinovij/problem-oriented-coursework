import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdParameterDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { LikeEntity } from './like.entity';
import {
  CreateCommentLikeDto,
  FindCommentLikeDto,
  CreateInitiativeLikeDto,
  FindInitiativeLikeDto,
} from './dto';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';

@ApiTags('likes')
@Controller('likes')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('/comments/user-like')
  findCommentLike(@Query() params: FindCommentLikeDto): Promise<LikeEntity> {
    const conditions = {
      user: { id: params.userId },
      comments: { id: params.commentId },
    };

    return this.likesService.findCommentLike(conditions);
  }

  @Get('/comments/count-likes/:id')
  countLikesByCommentId(@Param() conditions: IdParameterDto): Promise<number> {
    return this.likesService.countLikesByCommentId(conditions);
  }

  @Post('/comments')
  createCommentLike(
    @Body() createEntityDto: CreateCommentLikeDto,
  ): Promise<LikeEntity> {
    return this.likesService.createCommentLike(createEntityDto);
  }

  @Delete('/comments/:id')
  deleteCommentLike(@Param() conditions: IdParameterDto): Promise<LikeEntity> {
    return this.likesService.deleteCommentLike(conditions);
  }

  @Get('/initiatives/user-like')
  findInitiativeLike(
    @Query() params: FindInitiativeLikeDto,
  ): Promise<LikeEntity> {
    const conditions = {
      user: { id: params.userId },
      initiatives: { id: params.initiativeId },
    };

    return this.likesService.findInitiativeLike(conditions);
  }

  @Get('/initiatives/count-likes/:id')
  countLikesByInitiativeId(
    @Param() conditions: IdParameterDto,
  ): Promise<number> {
    return this.likesService.countLikesByInitiativeId(conditions.id);
  }

  @Post('/initiatives')
  createInitiativeLike(
    @Body() createEntityDto: CreateInitiativeLikeDto,
  ): Promise<LikeEntity> {
    return this.likesService.createInitiativeLike(createEntityDto);
  }

  @Delete('/initiatives/:id')
  deleteInitiativeLike(
    @Param() conditions: IdParameterDto,
  ): Promise<LikeEntity> {
    return this.likesService.deleteInitiativeLike(conditions);
  }
}
