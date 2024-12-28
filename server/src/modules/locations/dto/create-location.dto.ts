import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ type: 'number', required: true })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ type: 'number', required: true })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @ApiProperty({
    example: 'UA-07',
    required: true,
    nullable: false,
    minLength: 5,
    maxLength: 5,
  })
  geocode: string;
}
