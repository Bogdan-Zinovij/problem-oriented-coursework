import { ApiProperty } from '@nestjs/swagger';
import { InitiativeStatusEnum } from 'src/common/enums';

export class ChangeStatusDto {
  @ApiProperty({
    enum: InitiativeStatusEnum,
    default: InitiativeStatusEnum.CREATED,
  })
  status: InitiativeStatusEnum;
}
