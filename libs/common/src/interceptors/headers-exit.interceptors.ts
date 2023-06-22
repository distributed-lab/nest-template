import {
  HEADER_TIME_ENTRY,
  HEADER_TIME_EXECUTE,
  HEADER_TIMESTAMP_ENTRY,
  HEADER_TIMESTAMP_EXIT,
} from '@common/consts'
import { Logger } from '@common/logger'
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Request, Response as EResponse } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Observable, tap } from 'rxjs'

export interface Response<T> extends EResponse<T, any> {
  data: T
}

@Injectable()
export class HeadersExitInterceptor<T = any, R = any> implements NestInterceptor<T, R> {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}

  private static handleHeadersBeforeExit(context: ExecutionContext) {
    const hostType = context.getType()

    if (hostType !== 'http') return

    // Get time-end
    const timestampExit = Date.now()

    // Handle Execute time
    const httpContext = context.switchToHttp()
    const request: Request = httpContext.getRequest<Request>()
    const timestampEntry = request.header(HEADER_TIMESTAMP_ENTRY)
    const timestampEntryNumber = Number(timestampEntry)
    const timeEntry = new Date(timestampEntryNumber).toISOString()
    const timeExecute = timestampExit - Number(timestampEntryNumber)

    // Set response timers headers
    const response: Response<any> = httpContext.getResponse<Response<any>>()
    response.header(HEADER_TIMESTAMP_ENTRY, timestampEntry)
    response.header(HEADER_TIMESTAMP_EXIT, String(timestampExit))
    response.header(HEADER_TIME_ENTRY, timeEntry)
    response.header(HEADER_TIME_EXECUTE, String(timeExecute))
  }

  intercept(context: ExecutionContext, next: CallHandler<T | R>): Observable<R> {
    return next.handle().pipe(
      tap<T | R>({
        next: (): void => {
          HeadersExitInterceptor.handleHeadersBeforeExit(context)
        },
        error: (): void => {
          HeadersExitInterceptor.handleHeadersBeforeExit(context)
        },
      }),
    ) as Observable<R>
  }
}
