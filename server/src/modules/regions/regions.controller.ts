import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdParameterDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegionEntity } from './region.entity';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { UserRoleEnum } from 'src/common/enums';
import { HasRoles } from '../auth/decorators';
import { CreateRegionDto } from './dto';
import { RegionsService } from './regions.service';

@ApiTags('regions')
@Controller('regions')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  findAll(): Promise<RegionEntity[]> {
    return this.regionsService.findAll();
  }

  @Get(':id')
  findOne(@Param() conditions: IdParameterDto): Promise<RegionEntity> {
    return this.regionsService.findOne(conditions);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Post()
  createOne(@Body() createEntityDto: CreateRegionDto): Promise<RegionEntity> {
    return this.regionsService.createOne(createEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto): Promise<RegionEntity> {
    return this.regionsService.deleteOne(conditions);
  }
}
