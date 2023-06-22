import { NodeEnv } from '@common/enums'
import { Config } from '@common/types'
import * as joi from 'joi'

const logFileRE = /[a-zA-Z1-9_.]\.log/

export const validationSchema = joi.object<Config>({
  nodeEnv: joi
    .string()
    .equal(...Object.values(NodeEnv))
    .default(NodeEnv.Development),
  app: {
    name: joi.string().required(),
    host: joi.string().allow('').required(),
    port: joi.number().default(3000).required(),
    globalPrefix: joi.string().default('v1'),
  },
  db: {
    host: joi.string().required().default('localhost'),
    port: joi.number().required().default(5432),
    username: joi.string().required().default('postgres'),
    password: joi.string().required().default('postgres'),
    database: joi.string().required(),
    synchronize: joi.boolean().default(false),
    logging: joi.boolean().default(true),
  },
  log: {
    errorFile: joi.string().optional().allow('').pattern(logFileRE),
    combinedFile: joi.string().optional().pattern(logFileRE),
    level: joi.string().equal('debug', 'info').default('info'),
    inJson: joi.boolean().equal(true, false).default(false),
  },
  sentry: {
    dsn: joi.string().allow(''),
    sampleRate: joi.number().precision(2).min(0).max(1).optional(),
  },
  http: {
    timeout: joi.number().default(60e3),
    maxRedirects: joi.number().default(2),
  },
  redis: {
    host: joi.string().required(),
    port: joi.number().required(),
    auth: joi.string().allow('').required(),
    ttl: joi.number().default(900),
  },
})
