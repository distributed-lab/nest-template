import {
  HEADER_REQUEST_ID,
  HEADER_SESSION_ID,
  HEADER_TIME_ENTRY,
  HEADER_TIME_EXECUTE,
  HEADER_TIMESTAMP_ENTRY,
  HEADER_TIMESTAMP_EXIT,
} from '@common/consts'
import { SentrySeverity } from '@common/enums'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import * as Sentry from '@sentry/minimal'
import { Severity } from '@sentry/node'
import { CaptureContext } from '@sentry/types'
import { Request as NodeRequest, Response } from 'express'
import { isString } from 'lodash'
import { tap } from 'rxjs/operators'

interface Request extends NodeRequest {
  _parsedUrl: {
    protocol: string
    slashes: string
    auth: string
    host: string
    port: string
    hostname: string
    hash: string
    search: string
    query: string
    pathname: string
    path: string
    href: string
    _raw: string
  }
}

interface SentryEntry {
  body: any
  origin: any
  action: any
}

@Injectable()
export class SentryLogInterceptor implements NestInterceptor {
  private sentryLog(
    err: Error | string,
    sentryParams: CaptureContext,
    severity: SentrySeverity,
    entry: SentryEntry,
  ) {
    Sentry.withScope(scope => {
      scope.setExtra('body', entry.body)
      scope.setExtra('origin', entry.origin)
      scope.setExtra('action', entry.action)
      scope.setLevel(severity as unknown as Severity)

      isString(err)
        ? Sentry.captureMessage(err, sentryParams)
        : Sentry.captureException(err, sentryParams)
    })
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap({
        next: null,
        error: err => {
          const hostType = context.getType()

          if (hostType !== 'http') return err

          const controllerName = context.getClass().name
          const contextHttp = context.switchToHttp()
          const request = contextHttp.getRequest<Request>()
          const response = contextHttp.getResponse<Response>()

          const reqId = response.get(HEADER_REQUEST_ID)
          const sessionId = response.get(HEADER_SESSION_ID)

          const sentryParams: CaptureContext = {
            level: String(SentrySeverity.Error) as Severity,
            tags: {
              sessionId,
              controllerName,
            },
            extra: {
              controllerName,
              reqId,
              sessionId,
              timeExecute: response.get(HEADER_TIME_EXECUTE),
              path: request.originalUrl,
              timeEntry: response.get(HEADER_TIME_ENTRY),
              timestampEntry: response.get(HEADER_TIMESTAMP_ENTRY),
              timestampExit: response.get(HEADER_TIMESTAMP_EXIT),
            },
            contexts: {
              ids: {
                sessionId,
                reqId,
              },
            },
            user: {
              sessionId,
            },
          }

          const { method, body, url } = request

          const entry = {
            action: method,
            origin: url,
            body: body,
          }

          const severity =
            err.status && err.status < 500 ? SentrySeverity.Warning : SentrySeverity.Error

          this.sentryLog(err, sentryParams, severity, entry)

          return err
        },
      }),
    )
  }
}
