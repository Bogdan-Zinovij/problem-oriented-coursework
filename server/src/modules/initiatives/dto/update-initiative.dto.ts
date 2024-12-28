import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateInitiativeDto {
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
}
