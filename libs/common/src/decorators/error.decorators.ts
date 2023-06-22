import { Logger } from '@common/logger'
import { HttpException } from '@nestjs/common'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosError } from 'axios'

export const RequestErrorHandler =
  () =>
  (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const method = propertyDescriptor.value

    propertyDescriptor.value = async function (...args: any): Promise<any> {
      const logger: Logger = this.logger
      try {
        return await method.apply(this, args)
      } catch (e: any | Error | AxiosError) {
        const context = `${this.constructor.name}.${propertyKey}`

        if (e.isAxiosError) {
          const stack = e.toJSON().stack
          logger.error(
            `Error ${e.request.method} ${e.request.path}${
              e.request.data ? `\n${e.request.data}` : ''
            }`,
            stack,
            context,
          )
          if (e.request?.res) {
            const error = new HttpException(e.request.res?.statusMessage, e.request.res?.statusCode)
            logger.error(error, stack, context)
            throw error
          }
        } else {
          logger.error(e, e.stack, context)
          if (e.code) {
            const error = new HttpException(e.message, e.code)
            logger.error(error, e.stack, context)
            throw error
          }
        }
        throw e
      }
    }

    return propertyDescriptor
  }
