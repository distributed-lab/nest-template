import { HEADER_REQUEST_ID, HEADER_SESSION_ID } from '@common/consts'
import { ctx } from '@common/helpers'
import { Logger } from '@common/logger'
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

const createKey = (config: AxiosRequestConfig): string => {
  const params = config.params ? ':' + JSON.stringify(config.params) : ''
  return `${config.method.toUpperCase()}:${config.url}${params}`
}

export const createReqInterceptor =
  (logger: Logger, key: string) => (config: AxiosRequestConfig) => {
    key = createKey(config)

    logger.time(key)

    const context = ctx()
    const reqId = context?.reqId
    const sessionId = context?.sessionId

    reqId && (config.headers[HEADER_REQUEST_ID] = reqId)
    sessionId && (config.headers[HEADER_SESSION_ID] = sessionId)

    return config
  }

export const createRespSuccessInterceptor =
  (logger: Logger, key: string) => (response: AxiosResponse) => {
    key = createKey(response.config)
    logger.timeEnd(key)
    return response
  }

export const createRespFailInterceptor = (logger: Logger, key: string) => (err: AxiosError) => {
  key = createKey(err.config)
  logger.timeEnd(key)
  return Promise.reject(err)
}
