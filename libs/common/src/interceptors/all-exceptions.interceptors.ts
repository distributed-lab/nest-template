import {
  HEADER_REQUEST_ID,
  HEADER_SESSION_ID,
  HEADER_TIME_EXECUTE,
  HEADER_TIMESTAMP_ENTRY,
  HEADER_TIMESTAMP_EXIT,
} from '@common/consts'
import { ErrorResponseDto } from '@common/dto'
import { NodeEnv } from '@common/enums'
import { Logger } from '@common/logger'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost } from '@nestjs/core'
import { AxiosError } from 'axios'
import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {}

  catch(exception: any | Error | AxiosError, host: ArgumentsHost): void {
    const isProd = this.configService.get<NodeEnv>('nodeEnv') === NodeEnv.Production
    const isHttpException = exception instanceof HttpException

    const hideStack = isProd
    const hostType = host.getType()

    if (hostType !== 'http') {
      hideStack && delete exception.stack
      throw exception
    }

    const contextHttp = host.switchToHttp()

    let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR

    if (isHttpException) httpStatus = exception.getStatus()
    if (exception.isAxiosError) {
      httpStatus =
        exception?.response?.status ||
        exception?.response?.data?.status_code ||
        exception?.request?.res?.statusCode
    }

    const request: Request = contextHttp.getRequest<Request>()

    let error = exception.toString()
    let errorMessage = exception.isAxiosError
      ? exception?.response?.data?.message
      : exception.message

    const exceptionMsg = exception?.message ?? ''

    if (
      isProd &&
      exceptionMsg.startsWith('connect ECONNREFUSED') &&
      !exceptionMsg.endsWith('Service')
    ) {
      errorMessage = 'connect ECONNREFUSED'
      error = 'ECONNREFUSED'
    }

    const { httpAdapter } = this.httpAdapterHost

    const response: Response = contextHttp.getResponse<Response>()
    const reqId = response.get(HEADER_REQUEST_ID)
    const sessionId = response.get(HEADER_SESSION_ID)
    const timestampEntry = response.get(HEADER_TIMESTAMP_ENTRY)
    const timestampExit = response.get(HEADER_TIMESTAMP_EXIT)
    const timeExecute = response.get(HEADER_TIME_EXECUTE)

    const responseBody: ErrorResponseDto = plainToClass(ErrorResponseDto, {
      statusCode: httpStatus,
      error: error,
      message: exception?.response?.message || errorMessage || exception.message || exception,
      stack: hideStack ? undefined : exception.stack,
      timestampEntry: timestampEntry,
      timestampExit: timestampExit,
      timeExecute: timeExecute,
      path: httpAdapter.getRequestUrl(request),
      reqId,
      sessionId,
    })

    const newException = { ...exception, responseBody: responseBody }

    this.logger.error(newException, `${exception.stack || ''}\n${this.constructor.name}`)
    httpAdapter.reply(contextHttp.getResponse(), responseBody, httpStatus)
  }
}
