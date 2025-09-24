import { Module } from '@nestjs/common';
import { CitysService } from './citys.service';
import { CitysController } from './citys.controller';

@Module({
  controllers: [CitysController],
  providers: [CitysService],
})
export class CitysModule {}
