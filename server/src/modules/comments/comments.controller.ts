import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdParameterDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { UserRoleEnum } from 'src/common/enums';
import { HasRoles } from '../auth/decorators';

@ApiTags('comments')
@Controller('comments')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @HasRoles(UserRoleEnum.ADMIN)
  @Get()
  findAll(): Promise<CommentEntity[]> {
    return this.commentsService.findAll();
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Get(':id')
  findOne(@Param() conditions: IdParameterDto): Promise<CommentEntity> {
    return this.commentsService.findOne(conditions);
  }

  @Post()
  createOne(@Body() createEntityDto: CreateCommentDto): Promise<CommentEntity> {
    return this.commentsService.createOne(createEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Patch(':id')
  updateOne(
    @Param() conditions: IdParameterDto,
    @Body() updateEntityDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return this.commentsService.updateOne(conditions, updateEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto): Promise<CommentEntity> {
    return this.commentsService.deleteOne(conditions);
  }

  @Get('initiative/:id')
  getInitiativeComments(
    @Param() conditions: IdParameterDto,
  ): Promise<CommentEntity[]> {
    return this.commentsService.getInitiativeComments({
      initiative: { id: conditions.id },
    });
  }
}
