import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NewsService } from './news.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateNewsDto } from './dto/create-news.dto';


@ApiTags('Noticias')
@Public()
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de todas las noticias' })
  findAll() {
    return this.newsService.getAllNews();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener TODA la información de una noticia' })
  findOne(@Param('id') id: number) {
    return this.newsService.getNewByIDClean(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una noticia' })
  createNew(@Body() data: CreateNewsDto) {
    return this.newsService.createNew(data);
  }

}
