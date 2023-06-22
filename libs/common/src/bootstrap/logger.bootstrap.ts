import { NestExpressApplication } from '@nestjs/platform-express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

export function initLogger(app: NestExpressApplication): NestExpressApplication {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  return app
}
