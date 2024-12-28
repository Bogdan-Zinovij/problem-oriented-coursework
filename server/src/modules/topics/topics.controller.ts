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
import { CreateTopicDto, UpdateTopicDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { TopicEntity } from './topic.entity';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { UserRoleEnum } from 'src/common/enums';
import { HasRoles } from '../auth/decorators';

@ApiTags('topics')
@Controller('topics')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  findAll(): Promise<TopicEntity[]> {
    return this.topicsService.findAll();
  }

  @Get(':id')
  findOne(@Param() conditions: IdParameterDto): Promise<TopicEntity> {
    return this.topicsService.findOne(conditions);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Post()
  createOne(@Body() createEntityDto: CreateTopicDto): Promise<TopicEntity> {
    return this.topicsService.createOne(createEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Patch(':id')
  updateOne(
    @Param() conditions: IdParameterDto,
    @Body() updateEntityDto: UpdateTopicDto,
  ): Promise<TopicEntity> {
    return this.topicsService.updateOne(conditions, updateEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto): Promise<TopicEntity> {
    return this.topicsService.deleteOne(conditions);
  }
}
