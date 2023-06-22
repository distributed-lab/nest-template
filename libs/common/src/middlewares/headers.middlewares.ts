import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'

import { HEADER_REQUEST_ID, HEADER_TIMESTAMP_ENTRY } from '../consts'

export function headers(req: Request, res: Response, next: NextFunction): void {
  req.headers[HEADER_TIMESTAMP_ENTRY] = Date.now().toString()

  let reqId = req.header(HEADER_REQUEST_ID)
  if (!reqId) {
    reqId = uuid()
    req.headers[HEADER_REQUEST_ID] = reqId // hard override if no method to change/set as it's Request, not Resp
  }
  next()
}

@Injectable()
export class HeadersMiddleware implements NestMiddleware {
  use = headers
}
