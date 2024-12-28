import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto, SingInDto } from './dto';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { AuthTokens, AccessJwtPayload, RefreshJwtPayload } from './types';
import { AppConfigService } from 'src/config/app-config.service';
import { UserEntity } from '../users/user.entity';
import { FindOptionsWhere } from 'typeorm';
import { RefreshTokenEntity } from '../refresh-tokens/refresh-token.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret: string;
  private readonly jwtAccessExpiresIn: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.jwtAccessSecret =
      this.appConfigService.get<string>('JWT_ACCESS_SECRET');
    this.jwtAccessExpiresIn = this.appConfigService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    this.jwtRefreshSecret =
      this.appConfigService.get<string>('JWT_REFRESH_SECRET');
    this.jwtRefreshExpiresIn = this.appConfigService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthTokens> {
    const userExists = await this.usersService
      .findOne({ email: signUpDto.email })
      .catch(() => null);

    if (userExists) {
      throw new ConflictException(AppErrorMessagesEnum.USER_ALREADY_EXISTS);
    }

    const user = await this.usersService.createOne(signUpDto);

    const tokens = await this.createUserTokens(user);

    return tokens;
  }

  async signIn(signInDto: SingInDto): Promise<AuthTokens> {
    const user = await this.usersService
      .findOne({ email: signInDto.email })
      .catch(() => {
        throw new UnauthorizedException(AppErrorMessagesEnum.UNAUTHORIZED);
      });

    const passwordMatches = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!passwordMatches)
      throw new UnauthorizedException(AppErrorMessagesEnum.UNAUTHORIZED);

    const tokens = await this.createUserTokens(user);

    await this.refreshTokensService.deleteExceededRefreshTokens({
      user: { id: user.id },
    });

    return tokens;
  }

  async signOut(refreshTokenId: FindOptionsWhere<RefreshTokenEntity>) {
    return this.refreshTokensService.deleteOne(refreshTokenId);
  }

  async refreshTokens(
    condition: FindOptionsWhere<UserEntity>,
    refreshTokenId: FindOptionsWhere<RefreshTokenEntity>,
  ): Promise<AuthTokens> {
    const user = await this.usersService.findOne(condition);

    await this.refreshTokensService.deleteOne(refreshTokenId);

    const tokens = await this.createUserTokens(user);

    return tokens;
  }

  async generateTokens(
    user: UserEntity,
    refreshTokenId: string,
  ): Promise<AuthTokens> {
    const accessTokenPayload: AccessJwtPayload = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      role: user.role,
    };

    const refreshTokenPayload: RefreshJwtPayload = {
      ...accessTokenPayload,
      refreshTokenId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.jwtAccessSecret,
        expiresIn: this.jwtAccessExpiresIn,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      }),
    ]);

    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
    };

    return tokens;
  }

  async createUserTokens(user: UserEntity): Promise<AuthTokens> {
    const refreshTokenId = uuidv4();
    const tokens = await this.generateTokens(user, refreshTokenId);
    await this.refreshTokensService.createRefreshToken(
      { id: user.id },
      { value: tokens.refreshToken, id: refreshTokenId },
    );

    return tokens;
  }

  async findUser(
    conditions: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity> {
    return this.usersService.findOne(conditions);
  }
}
