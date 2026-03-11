import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ContentEngineService } from './content-engine.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ApiKeyGuard } from '../security/guards/api-key.guard';

@Controller('content')
export class ContentEngineController {
  constructor(private readonly contentEngine: ContentEngineService) {}

  @Get()
  findAll() {
    return this.contentEngine.findAll();
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreateContentDto) {
    return this.contentEngine.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentEngine.findOne(id);
  }

  @Put(':id')
  @UseGuards(ApiKeyGuard)
  update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentEngine.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  remove(@Param('id') id: string) {
    return this.contentEngine.remove(id);
  }
}
