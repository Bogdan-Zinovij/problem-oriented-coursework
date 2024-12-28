import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @ApiProperty({
    example: 'Вінницька область',
    required: true,
    nullable: false,
    minLength: 1,
    maxLength: 64,
  })
  public readonly name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @ApiProperty({
    example: 'UA-05',
    required: true,
    nullable: false,
    minLength: 5,
    maxLength: 5,
  })
  public readonly geocode: string;
}
