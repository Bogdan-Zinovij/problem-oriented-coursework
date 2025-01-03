import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SingInDto, SignUpDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, RefreshTokenGuard } from 'src/modules/auth/guards';
import { User } from 'src/common/decorators';
import { AuthTokens, JwtPayloadUser } from './types';
import { UserEntity } from '../users/user.entity';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthTokens> {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  signIn(@Body() signInDto: SingInDto): Promise<AuthTokens> {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('signout')
  signOut(@User() user: JwtPayloadUser) {
    return this.authService.signOut({ id: user.refreshTokenId });
  }

  @UseGuards(RefreshTokenGuard)
  @Post('tokens/refresh')
  refreshTokens(@User() user: JwtPayloadUser): Promise<AuthTokens> {
    return this.authService.refreshTokens(
      { id: user.id },
      { id: user.refreshTokenId },
    );
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@User() user: JwtPayloadUser): Promise<UserEntity> {
    return this.authService.findUser({ id: user.id });
  }
}
