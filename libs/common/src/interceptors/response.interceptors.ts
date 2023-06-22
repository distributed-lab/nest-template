import {
  HEADER_REQUEST_ID,
  HEADER_SESSION_ID,
  HEADER_TIME_ENTRY,
  HEADER_TIME_EXECUTE,
  HEADER_TIMESTAMP_ENTRY,
  HEADER_TIMESTAMP_EXIT,
} from '@common/consts'
import { ResponseMetaDto } from '@common/dto'
import { Logger } from '@common/logger'
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Response as EResponse } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> extends EResponse<T, any> {
  data: T
}

@Injectable()
export class ResponseInterceptor<T = any, R = any> implements NestInterceptor<T, Response<R>> {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<Response<R> | T>,
  ): Observable<Response<R>> {
    return next.handle().pipe(
      // Add Meta for response body
      map<Response<R>, Response<R>>((data: Response<R>) => {
        const hostType = context.getType()

        if (hostType !== 'http') return data

        const httpContext = context.switchToHttp()
        const response: Response<any> = httpContext.getResponse<Response<any>>()

        // init Meta Data
        const reqId = response.get(HEADER_REQUEST_ID)
        const sessionId = response.get(HEADER_SESSION_ID)
        const timestampEntry = response.get(HEADER_TIMESTAMP_ENTRY)
        const timestampExit = response.get(HEADER_TIMESTAMP_EXIT)
        const timeEntry = response.get(HEADER_TIME_ENTRY)
        const timeExecute = response.get(HEADER_TIME_EXECUTE)

        // create Meta Object
        const meta: ResponseMetaDto = {
          timestampEntry,
          timestampExit,
          timeEntry,
          timeExecute,
          reqId,
          sessionId,
        }

        // Log Response Meta only
        this.logger.log(
          {
            ...meta,
            type: 'RESPONSE',
          },
          'RESPONSE',
        )
        return Object.assign(data, meta)
      }) as any,
    )
  }
}
