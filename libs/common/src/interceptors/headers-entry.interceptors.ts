import { HEADER_REQUEST_ID, HEADER_SESSION_ID, HEADER_TIME_ENTRY } from '@common/consts'
import { ctx } from '@common/helpers'
import { Logger } from '@common/logger'
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Request, Response as EResponse } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Observable } from 'rxjs'

export interface Response<T> extends EResponse<T, any> {
  data: T
}

@Injectable()
export class HeadersEntryInterceptor<T = any, R = any> implements NestInterceptor<T, R> {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler<T | R>): Observable<R> {
    const hostType = context.getType()

    if (hostType !== 'http') return next.handle() as Observable<R>

    // Get request headers meta
    const httpContext = context.switchToHttp()
    const request: Request = httpContext.getRequest<Request>()
    const reqId = request.header(HEADER_REQUEST_ID)
    const sessionId = request.header(HEADER_SESSION_ID)
    const timeEntry = request.header(HEADER_TIME_ENTRY)

    // Add to Execute Context
    const exContext = ctx()

    if (exContext) {
      exContext.reqId = reqId
      exContext.sessionId = sessionId
    }

    // Add headers to response
    const response: Response<any> = httpContext.getResponse<Response<any>>()
    response.header(HEADER_REQUEST_ID, reqId)
    response.header(HEADER_SESSION_ID, sessionId || '0')
    response.header(HEADER_TIME_ENTRY, timeEntry)

    return next.handle() as Observable<R>
  }
}
