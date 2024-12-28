import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
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
}
