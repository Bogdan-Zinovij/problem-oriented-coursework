import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParameterDto {
  @IsUUID()
  @ApiProperty({ type: String })
  public readonly id: string;
}
