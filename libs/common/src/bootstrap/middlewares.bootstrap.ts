import { headers } from '@common/middlewares'
import { NestExpressApplication } from '@nestjs/platform-express'

export function initMiddlewares(app: NestExpressApplication): NestExpressApplication {
  app.use(headers)
  return app
}
