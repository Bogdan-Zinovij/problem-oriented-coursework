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
import { CreateLocationDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { LocationEntity } from './location.entity';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { UserRoleEnum } from 'src/common/enums';
import { HasRoles } from '../auth/decorators';

@ApiTags('locations')
@Controller('locations')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(): Promise<LocationEntity[]> {
    return this.locationsService.findAll();
  }

  @Get(':id')
  findOne(@Param() conditions: IdParameterDto): Promise<LocationEntity> {
    return this.locationsService.findOne(conditions);
  }

  @Post()
  createOne(
    @Body() createEntityDto: CreateLocationDto,
  ): Promise<LocationEntity> {
    return this.locationsService.createOne(createEntityDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto): Promise<LocationEntity> {
    return this.locationsService.deleteOne(conditions);
  }
}
