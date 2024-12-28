import { Module } from '@nestjs/common';
import { LocationEntity } from './location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { RegionsModule } from '../regions';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity]), RegionsModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
