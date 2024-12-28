import { Module } from '@nestjs/common';
import { ImageEntity } from './image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { StorageModule } from 'src/systems/storage';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([ImageEntity])],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
