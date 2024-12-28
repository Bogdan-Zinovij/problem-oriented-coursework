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
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { IdParameterDto } from 'src/common/dto';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, RolesGuard } from '../auth/guards';
import { HasRoles } from '../auth/decorators';
import { UserRoleEnum } from 'src/common/enums';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @HasRoles(UserRoleEnum.ADMIN)
  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Get(':id')
  findOne(@Param() conditions: IdParameterDto): Promise<UserEntity> {
    return this.usersService.findOne(conditions);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Post()
  createOne(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.createOne(createUserDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Patch(':id')
  updateOne(
    @Param() conditions: IdParameterDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.updateOne(conditions, updateUserDto);
  }

  @HasRoles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteOne(@Param() conditions: IdParameterDto): Promise<UserEntity> {
    return this.usersService.deleteOne(conditions);
  }
}
