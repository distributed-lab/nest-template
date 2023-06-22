import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const AddVersionDecorator = (...versions: string[]): CustomDecorator<string> =>
  SetMetadata('apiVersion', versions)
