import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get('/live')
  @HealthCheck()
  live() {
    return this.health.check([])
  }

  @Get('/ready')
  @HealthCheck()
  ready() {
    return this.health.check([])
  }
}
