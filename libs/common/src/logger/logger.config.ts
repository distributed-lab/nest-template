import { ConfigService } from '@nestjs/config'

import { winstonParams } from './winston'

export const getWinstonParams = async (configService: ConfigService) => {
  return winstonParams({
    logErrorFile: configService.get<string>('log.errorFile'),
    logCombineLog: configService.get<string>('log.combinedFile'),
    logInJSON: configService.get<boolean>('log.inJson'),
    level: configService.get<string>('log.level'),
    serviceName: configService.get<string>('app.name'),
    defaultMeta: { env: configService.get<string>('nodeEnv') },
  })
}
