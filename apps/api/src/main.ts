import {
  createLogger,
  initContext,
  initListening,
  initLogger,
  initMiddlewares,
  initPipes,
  initSentry,
  initSwagger,
} from '@common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import { install } from 'source-map-support'

import { AppModule } from './api.module'

const logger = createLogger()

install({ environment: 'node' })

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bodyParser: true,
    abortOnError: false,
    logger,
  })

  initSentry()
  initMiddlewares(app)
  initContext(app)
  initLogger(app)
  initSwagger(app)
  initPipes(app)

  app.use(helmet())

  await initListening(app)
}

bootstrap()
