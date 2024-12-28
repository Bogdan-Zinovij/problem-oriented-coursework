import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImageEntity } from './image.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IdParameterDto } from 'src/common/dto';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRoleEnum } from 'src/common/enums';
import { HasRoles } from '../auth/decorators';

@ApiTags('images')
@Controller('images')
@UseGuards(AccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async createOne(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageEntity> {
    return this.imagesService.createOne(file);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Get()
  findAll(): Promise<ImageEntity[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  findOne(@Param() conditions: IdParameterDto): Promise<ImageEntity> {
    return this.imagesService.findOne(conditions);
  }

  @Get('initiative/:id')
  getInitiativeImages(
    @Param() conditions: IdParameterDto,
  ): Promise<ImageEntity[]> {
    return this.imagesService.getInitiativeImages({
      initiatives: { id: conditions.id },
    });
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto) {
    return this.imagesService.deleteOne(conditions);
  }
}
