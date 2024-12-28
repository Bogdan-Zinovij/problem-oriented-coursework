import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUUID, IsOptional } from 'class-validator';
import { InitiativeStatusEnum } from 'src/common/enums';

export class CustomSearchDto {
  @ApiProperty({
    description: 'ID of the topic to search initiatives for',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly topicId?: string;

  @ApiProperty({
    description: 'ID of the region to search initiatives for',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly regionId?: string;

  @ApiProperty({
    description: 'Title to search for',
    example: 'initiative',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly title?: string;

  @ApiProperty({
    description: 'Initiative status to search for',
    example: 'Created',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly status?: InitiativeStatusEnum;

  @ApiProperty({
    description: 'Start date of the created at range',
    example: '2023-01-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly createdAtStart?: Date;

  @ApiProperty({
    description: 'End date of the created at range',
    example: '2023-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly createdAtEnd?: Date;
}
