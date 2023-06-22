import { context } from '@common/middlewares'
import { NestExpressApplication } from '@nestjs/platform-express'

export function initContext(app: NestExpressApplication): NestExpressApplication {
  app.use(context)
  return app
}
