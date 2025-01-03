import { UserRoleEnum } from 'src/common/enums';

export type JwtPayloadUser = {
  id: string;
  name: string;
  surname: string;
  role: UserRoleEnum;
  refreshTokenId?: string;
};
