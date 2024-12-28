import { Module } from '@nestjs/common';
import { DatabaseModule } from './systems/database';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth';
import { LocationsModule } from './modules/locations';
import { TopicsModule } from './modules/topics';
import { CommentsModule } from './modules/comments';
import { InitiativesModule } from './modules/initiatives';
import { ImagesModule } from './modules/images';
import { RegionsModule } from './modules/regions';
import { LikesModule } from './modules/likes';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    LocationsModule,
    RegionsModule,
    TopicsModule,
    CommentsModule,
    InitiativesModule,
    LikesModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
