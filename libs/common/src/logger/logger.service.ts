import { LogLevel } from '@common/enums'
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { isPlainObject, isString } from 'lodash'
import { WinstonLogger } from 'nest-winston'
import { Logger as WinstonLoggerInterface } from 'winston'

import { createLogger } from './winston'

export type LogMessage = Partial<{ message: string; level?: LogLevel | number }>

@Injectable()
export class Logger extends WinstonLogger implements NestLoggerService {
  static logger = createLogger()
  private static times: Map<string, number> = new Map()
  private readonly times: Map<string, number> = new Map()

  constructor(logger: WinstonLoggerInterface) {
    super(logger)
  }

  static getTimeInfo(idMessage: string | LogMessage, message?: string | LogMessage): string[] {
    const id: string = (idMessage as LogMessage)?.message || (idMessage as string)

    const msg: string =
      (message as LogMessage)?.message ||
      (message as string) ||
      (idMessage as LogMessage)?.message ||
      (idMessage as string)
    return [id, msg]
  }

  static time(idMessage: string | LogMessage): number {
    const start = Date.now()
    const [id] = Logger.getTimeInfo(idMessage)
    Logger.times.set(id, start)
    return start
  }

  static timeEnd(
    idMessage: string | LogMessage,
    message?: string | LogMessage,
    context?: string | Record<string, string | number>,
  ): number {
    const [id, msg] = Logger.getTimeInfo(idMessage, message)
    const start = Logger.times.get(id)

    if (!start) {
      return Logger.logger.warn(`!Timer ${id} does not exist`)
    }

    const finish = Date.now()

    Logger.times.delete(id)

    const diff = finish - start

    Logger.logger.debug(
      {
        ...(context as object),
        message: `${msg} ${diff} ms (${diff / 1000} s)`,
      },
      'Time',
    )
    return diff
  }

  public error(message: any, traceOrMeta?: string | object, context?: string): any {
    let trace: string
    let meta: object = null

    if (isPlainObject(traceOrMeta)) {
      meta = traceOrMeta as object
    }

    if (isString(traceOrMeta)) {
      trace = traceOrMeta as string
    }

    return Logger.logger.error(meta ? { ...meta, message } : message, trace, context)
  }

  public time(idMessage: string | LogMessage): number {
    const start = Date.now()
    const [id] = Logger.getTimeInfo(idMessage)
    this.times.set(id, start)
    return start
  }

  public timeEnd(
    idMessage: string | LogMessage,
    message?: string | LogMessage,
    context?: string | Record<string, string | number>,
  ): number {
    const [id, msg] = Logger.getTimeInfo(idMessage, message)
    const start = this.times.get(id)

    if (!start) {
      return this.warn(`!!Timer ${id} does not exist`)
    }

    const finish = Date.now()

    this.times.delete(id)

    const diff = finish - start

    this.debug(
      {
        ...(context as object),
        message: `${msg} ${diff} ms (${diff / 1000} s)`,
      },
      'Time',
    )
    return diff
  }
}
