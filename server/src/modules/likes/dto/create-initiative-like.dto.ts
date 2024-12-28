import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateInitiativeLikeDto {
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
}
