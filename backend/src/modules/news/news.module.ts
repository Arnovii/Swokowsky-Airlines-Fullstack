import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    MailModule
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule { }
