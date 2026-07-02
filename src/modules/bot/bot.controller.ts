import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ControllerService } from '../controller/controller.service';
import { Bot } from '../../entities/bot.entity';
import { CreateBotDto } from './dto/create-bot.dto';

@ApiTags('Bots')
@Controller('bots')
export class BotsController {
  constructor(private readonly controllerService: ControllerService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new bot' })
  @ApiResponse({ status: 201, description: 'Bot created', type: Bot })
  async create(@Body() body: CreateBotDto): Promise<Bot> {
    return this.controllerService.addBot(body.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bots' })
  @ApiResponse({ status: 200, description: 'List of bots', type: [Bot] })
  async findAll(): Promise<Bot[]> {
    return this.controllerService.findAllBots();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a bot' })
  @ApiResponse({ status: 200, description: 'Bot removed' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.controllerService.removeBot(Number(id));
  }
}
