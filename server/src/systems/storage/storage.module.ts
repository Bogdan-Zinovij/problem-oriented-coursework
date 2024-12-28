import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AppConfigModule } from 'src/config';

@Module({
  imports: [AppConfigModule, AppConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
