import { loadConfiguration } from '@common/config'
import { LogLevel } from '@common/enums'
import { RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'

import { version } from '../../../../package.json'

// This allows TypeScript to detect our global value
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace NodeJS {
    interface Global {
      __rootdir__: string
    }
  }
}

// eslint-disable-next-line no-underscore-dangle
global.__rootdir__ = __dirname || process.cwd()

// This allows TypeScript to detect our global value
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace NodeJS {
    interface Global {
      __rootdir__: string
    }
  }
}

// eslint-disable-next-line no-underscore-dangle
global.__rootdir__ = __dirname || process.cwd()

// arg sentryDSN for test reason only
export const initSentry = function (sentryDSN?: string): void {
  const { sentry, nodeEnv, app, log } = loadConfiguration()
  const dsn = sentryDSN || sentry.dsn

  if (!dsn) return

  Sentry.init({
    tracesSampleRate: Number(sentry.sampleRate) || 0,
    release: `${app.name}@${version}`,
    dsn: dsn,
    environment: nodeEnv,
    serverName: app.name,
    attachStacktrace: true,
    normalizeDepth: 10,
    debug: log.level === LogLevel.Debug,
    integrations: [
      new RewriteFrames({
        // eslint-disable-next-line no-underscore-dangle
        root: global.__rootdir__,
      }),
    ],
    beforeSend: function (event: Sentry.Event, hint: Sentry.EventHint) {
      const exception: any = hint.originalException

      if (exception.isAxiosError) {
        const excluded = [500, 502]
        const code =
          exception?.request?.res?.statusCode ||
          exception?.response?.status ||
          exception?.response?.data?.status_code

        if (excluded.includes(code)) return null

        event.fingerprint = [
          '{{ default }}',
          String(exception.functionName),
          String(exception.errorCode),
        ]
      }

      return event
    },
  })
}
