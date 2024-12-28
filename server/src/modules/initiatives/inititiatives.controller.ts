import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdParameterDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InitiativeEntity } from './initiative.entity';
import { InitiativesService } from './initiatives.service';
import {
  ChangeStatusDto,
  CreateInitiativeDto,
  CustomSearchDto,
  UpdateInitiativeDto,
} from './dto';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { UserRoleEnum } from 'src/common/enums';
import { HasRoles } from '../auth/decorators';

@ApiTags('initiatives')
@Controller('initiatives')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class InitiativesController {
  constructor(private readonly initiativesService: InitiativesService) {}

  @Get()
  findAll(): Promise<InitiativeEntity[]> {
    return this.initiativesService.findAll();
  }

  @Get('initiative/:id')
  findOne(@Param() conditions: IdParameterDto): Promise<InitiativeEntity> {
    return this.initiativesService.findOne(conditions);
  }

  @Get('user/:id')
  getUsersInitiatives(
    @Param() conditions: IdParameterDto,
  ): Promise<InitiativeEntity[]> {
    return this.initiativesService.getUsersInitiatives(conditions);
  }

  @Get('find-by-location/:id')
  findByLocation(
    @Param() conditions: IdParameterDto,
  ): Promise<InitiativeEntity> {
    console.log(conditions.id);
    return this.initiativesService.findOne({
      location: { id: conditions.id },
    });
  }

  @Get('find-by-search')
  findByCustomSearch(
    @Query() params: CustomSearchDto,
  ): Promise<InitiativeEntity[]> {
    return this.initiativesService.findByCustomSearch(params);
  }

  @Get('most-liked')
  getMostLiked(): Promise<InitiativeEntity[]> {
    return this.initiativesService.getMostLiked();
  }

  @Get('month-statistics')
  getMonthStatistics() {
    return this.initiativesService.getMonthStatistics();
  }

  @Post()
  createOne(
    @Body() createEntityDto: CreateInitiativeDto,
  ): Promise<InitiativeEntity> {
    return this.initiativesService.createOne(createEntityDto);
  }

  @Patch('initiative/:id')
  updateOne(
    @Param() conditions: IdParameterDto,
    @Body() updateEntityDto: UpdateInitiativeDto,
  ): Promise<InitiativeEntity> {
    return this.initiativesService.updateOne(conditions, updateEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Patch('change-status/:id')
  changeStatus(
    @Param() conditions: IdParameterDto,
    @Body() changeStatusDto: ChangeStatusDto,
  ): Promise<InitiativeEntity> {
    return this.initiativesService.changeStatus(conditions, changeStatusDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto): Promise<InitiativeEntity> {
    return this.initiativesService.deleteOne(conditions);
  }
}
