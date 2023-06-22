import { LogLevel, NodeEnv } from '@common'

export type Config = {
  nodeEnv: NodeEnv
  app: {
    name: string
    host: string
    port: number
    globalPrefix: string
  }
  db: {
    host: string
    port: number
    username: string
    password: string
    database: string
    synchronize: boolean
    logging: boolean
  }
  redis: {
    host: string
    port: number
    auth: string
    ttl: number
  }
  log: {
    errorFile: string
    combinedFile: string
    level: LogLevel
    inJson: boolean
  }
  sentry: {
    dsn: string
    sampleRate: number
  }
  http: {
    timeout: number
    maxRedirects: number
  }
}
