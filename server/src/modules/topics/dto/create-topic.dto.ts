import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @ApiProperty({
    example: 'Road problems',
    required: true,
    nullable: false,
    minLength: 1,
    maxLength: 64,
  })
  public readonly name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  @ApiProperty({
    example: 'This topic describes some road problems',
    required: false,
    nullable: true,
    minLength: 1,
    maxLength: 512,
  })
  public readonly description: string;
}
