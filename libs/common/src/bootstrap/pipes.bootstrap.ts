import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'

export function initPipes(app: NestExpressApplication): NestExpressApplication {
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  return app
}
