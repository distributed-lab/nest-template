import { loadConfiguration } from '@common/config'
import { ctx } from '@common/helpers'
import { LoggerService } from '@nestjs/common'
import { utilities, WinstonModule, WinstonModuleOptions } from 'nest-winston'
import * as winston from 'winston'
import * as Transport from 'winston-transport'

export type LogConfig = {
  logErrorFile: string
  logCombineLog: string
  logInJSON: boolean
  serviceName: string
  level: string
  defaultMeta?: Record<string, any>
}

const createBaseTransports = (
  logInJSON: boolean,
  logErrorFile: string,
  logCombineLog: string,
): Transport[] => {
  const transports: Transport[] = [
    new winston.transports.Console({
      format: logInJSON
        ? winston.format.json()
        : winston.format.combine(winston.format.timestamp(), utilities.format.nestLike()),
    }),
  ]

  // - Write all logs with level `error` and below to `error.log`
  logErrorFile &&
    transports.push(new winston.transports.File({ level: 'error', filename: logErrorFile }))
  // - Write all logs with level `info` and below to `combined.log`
  logCombineLog && transports.push(new winston.transports.File({ filename: logCombineLog }))

  return transports
}

export const winstonParams = ({
  logErrorFile,
  logCombineLog,
  logInJSON,
  serviceName,
  level,
  defaultMeta,
}: LogConfig): WinstonModuleOptions => {
  const transports: Transport[] = createBaseTransports(logInJSON, logErrorFile, logCombineLog)

  const infoFormat = winston.format(<T>(info) => {
    const context = ctx()
    const reqId = info.reqId || context?.reqId
    const sessionId = info.sessionId || context?.sessionId || undefined
    if (reqId || sessionId) {
      info.meta = {
        reqId,
        sessionId,
      }
    }
    return info as T
  })

  return {
    level,
    format: winston.format.combine(infoFormat(), winston.format.json()),
    defaultMeta: Object.assign({ service: serviceName }, defaultMeta),
    transports,
  }
}

export const createLogger = (): LoggerService => {
  const globalConfig = loadConfiguration()
  const logConfig = globalConfig.log

  const config: LogConfig = {
    logErrorFile: logConfig.errorFile,
    logCombineLog: logConfig.combinedFile,
    logInJSON: logConfig.inJson,
    serviceName: globalConfig.app.name,
    level: logConfig.level,
    defaultMeta: { env: globalConfig.nodeEnv, service: globalConfig.app.name },
  }

  return WinstonModule.createLogger(winstonParams(config))
}

export const createJobLogger = (): LoggerService => {
  const globalConfig = loadConfiguration()
  const logConfig = globalConfig.log
  const transports = createBaseTransports(
    logConfig.inJson,
    logConfig.errorFile,
    logConfig.combinedFile,
  )

  return WinstonModule.createLogger({
    level: logConfig.level,
    format: winston.format.combine(winston.format.json()),
    defaultMeta: { env: globalConfig.nodeEnv, service: globalConfig.app.name },
    transports: transports,
  })
}
