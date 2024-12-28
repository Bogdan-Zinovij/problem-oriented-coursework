import { UserRoleEnum } from 'src/common/enums';

export type AccessJwtPayload = {
  id: string;
  name: string;
  surname: string;
  role: UserRoleEnum;
};
