import { Module } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ImagesModule } from '../images';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity]), ImagesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
