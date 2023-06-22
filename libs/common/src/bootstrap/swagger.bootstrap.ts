import { loadConfiguration } from '@common/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { NodeEnv } from '../enums'

export function initSwagger(app: NestExpressApplication, version = '1.0'): NestExpressApplication {
  const { nodeEnv, app: appCfg } = loadConfiguration()

  if (nodeEnv === NodeEnv.Production) return app

  const config = new DocumentBuilder()
    .setTitle(appCfg.name)
    .setDescription(`${appCfg.name} description`)
    .setVersion(version)
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)

  return app
}
