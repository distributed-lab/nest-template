import { APP_INTERCEPTOR } from '@nestjs/core'

import { HeadersEntryInterceptor } from './headers-entry.interceptors'
import { HeadersExitInterceptor } from './headers-exit.interceptors'
import { ResponseInterceptor } from './response.interceptors'
import { SentryLogInterceptor } from './sentry-log.interceptors'

export const basicInterceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: HeadersEntryInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: SentryLogInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: HeadersExitInterceptor,
  },
]

export * from './all-exceptions.interceptors'
