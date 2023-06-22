import { createLogger } from '@common/logger'
import { Config } from '@common/types'
import { ConfigModuleOptions } from '@nestjs/config'
import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'

import { validationSchema } from './validation-schema.config'

const validationOptions = {
  abortEarly: true,
}

export const loadConfiguration = (): Config => {
  return yaml.load(readFileSync(join(process.env.CONFIG_FILE || 'config.yaml'), 'utf8')) as Config
}

export const config: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  ignoreEnvVars: true,
  load: [loadConfiguration],
  validationSchema,
  validationOptions,
  validate: (record): ReturnType<ConfigModuleOptions['validate']> => {
    const { error, value: validatedConfig } = validationSchema.validate(record, {
      allowUnknown: true,
      ...validationOptions,
    })
    if (error) {
      // NOTE: Environment variables validation failed, service will crash
      // We try to log as much information as possible
      const logger = createLogger()
      logger.error(`Config validation error: ${error.message}`, null, 'Config validation')
      throw new Error(`Config validation error: ${error.message}`)
    }
    return validatedConfig
  },
}
