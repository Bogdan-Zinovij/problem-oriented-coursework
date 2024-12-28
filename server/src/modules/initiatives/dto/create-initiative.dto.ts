import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateLocationDto } from 'src/modules/locations/dto';

export class CreateInitiativeDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  @ApiProperty({
    example: 'Initiative 1',
    required: true,
    nullable: false,
    minLength: 1,
    maxLength: 128,
  })
  public readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  @ApiProperty({
    example: 'This initiative describes some road problems',
    required: true,
    nullable: false,
    minLength: 1,
    maxLength: 512,
  })
  public readonly description: string;

  @IsUUID()
  @ApiProperty({
    type: 'string',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: true,
    nullable: false,
  })
  public readonly userId: string;

  @IsUUID()
  @ApiProperty({
    type: 'string',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: true,
    nullable: false,
  })
  public readonly topicId: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
    nullable: true,
  })
  public readonly imageId?: string;

  @ApiProperty({
    type: CreateLocationDto,
    required: true,
    nullable: false,
  })
  location: CreateLocationDto;
}
