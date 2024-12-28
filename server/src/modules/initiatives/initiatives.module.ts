import { Module } from '@nestjs/common';
import { InitiativeEntity } from './initiative.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitiativesController } from './inititiatives.controller';
import { InitiativesService } from './initiatives.service';
import { LocationsModule } from '../locations';
import { ImagesModule } from '../images';
import { LikesModule } from '../likes';
import { CommentsModule } from '../comments';

@Module({
  imports: [
    TypeOrmModule.forFeature([InitiativeEntity]),
    LikesModule,
    LocationsModule,
    ImagesModule,
    CommentsModule,
  ],
  controllers: [InitiativesController],
  providers: [InitiativesService],
  exports: [InitiativesService],
})
export class InitiativesModule {}
