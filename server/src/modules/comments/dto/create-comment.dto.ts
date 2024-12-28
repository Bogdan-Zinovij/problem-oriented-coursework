import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  @ApiProperty({
    example: 'This comment describes some road problems',
    required: true,
    nullable: false,
    minLength: 1,
    maxLength: 512,
  })
  public readonly text: string;

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
  public readonly initiativeId: string;

  @IsUUID()
  @ApiProperty({
    type: 'string',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
    nullable: true,
  })
  public readonly imageId: string;
}
