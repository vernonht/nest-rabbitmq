import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerService } from './modules/controller/controller.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly controllerService: ControllerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('state')
  async getState() {
    return this.controllerService.getState();
  }
}
