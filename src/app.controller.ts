import { Controller, Get } from '@nestjs/common';
import { ControllerService } from './modules/controller/controller.service';

@Controller()
export class AppController {
  constructor(private readonly controllerService: ControllerService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('state')
  async getState() {
    return this.controllerService.getState();
  }
}
