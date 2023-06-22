import { NextFunction, Request } from 'express'

import { HEADER_REQUEST_ID, HEADER_SESSION_ID } from '../consts'
import { ctx, runWithCtx } from '../helpers'

export const context = (req: Request, res: Response, next: NextFunction) => {
  runWithCtx(async () => next(), {})
}

export const withRequestId = (req: Request, res: Response, next: NextFunction) => {
  const context = ctx()
  context.reqId = req.header(HEADER_REQUEST_ID)
  context.sessionId = req.header(HEADER_SESSION_ID)
  return next()
}
