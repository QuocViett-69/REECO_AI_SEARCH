import { Module } from '@nestjs/common';
import { ImportParser } from './import.parser';
import { ImportValidator } from './import.validator';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService, ImportParser, ImportValidator],
})
export class ImportsModule {}
