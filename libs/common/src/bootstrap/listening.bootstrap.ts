import { loadConfiguration } from '@common/config'
import { NodeEnv } from '@common/enums'
import { NestExpressApplication } from '@nestjs/platform-express'

export async function initListening(app: NestExpressApplication): Promise<NestExpressApplication> {
  const config = loadConfiguration()
  await app.listen(config.app.port, config.app.host)
  if (config.nodeEnv === NodeEnv.Development) process.on('warning', e => console.warn(e.stack))
  return app
}
