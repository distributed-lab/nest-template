import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export class ResponseMetaDto {
  @ApiProperty({
    type: String,
    example: '2022-06-09T09:40:42.335Z',
  })
  timeEntry: string

  @ApiProperty({
    type: String,
    example: '1650579202013',
  })
  timestampEntry: string

  @ApiProperty({
    type: String,
    example: '1650579202034',
  })
  timestampExit: string

  @ApiProperty({
    type: String,
    example: '21',
  })
  timeExecute: string

  @ApiProperty({
    type: String,
    description: 'uuid generated at the api entry point',
    example: '5da02c35-b815-450d-9ce3-c0503b69e3ba',
  })
  reqId: string

  @ApiProperty({
    type: String,
    description: 'uuid generated at the api entry point',
    example: 'fab15d01-7cb6-4a14-ac4f-92785fa988c3',
    required: false,
  })
  sessionId: string
}

export class ErrorResponseDto extends ResponseMetaDto {
  @ApiProperty({
    enumName: 'HttpStatus',
    enum: HttpStatus,
    example: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  statusCode: HttpStatus

  @ApiProperty({
    type: String,
    example: 'connect ECONNREFUSED',
  })
  message: string

  @ApiProperty({
    type: String,
    example: 'Error: Request failed with status code 500\n at createError...',
    required: false,
  })
  stack?: string

  @ApiProperty({
    type: String,
    example: '/v1/chains',
  })
  path: string

  type?: string
}
