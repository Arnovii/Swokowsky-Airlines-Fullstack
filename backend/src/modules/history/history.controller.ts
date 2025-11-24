import { Controller, Get, Req } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async getHistory(@Req() req) {
    const userId = Number(req.user.id_usuario);
    return this.historyService.getUserHistory(userId);
  }
}
