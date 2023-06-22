import { loadConfiguration } from '@common/config'
import { NestExpressApplication } from '@nestjs/platform-express'

export function initPrefix(app: NestExpressApplication): NestExpressApplication {
  const config = loadConfiguration()
  app.setGlobalPrefix(config.app.globalPrefix)
  return app
}
