import { Response } from 'express'
import logger from '../logger'

const logError = (
  url: string,
  { response, stack, message }: { response: Response; stack?: string; message: string },
  msg: string,
) => {
  if (response) {
    const { status } = response
    logger.error({ url, status, stack, message }, msg)
  } else {
    logger.error({ url, stack, message }, msg)
  }
  return new Error(msg)
}

export default logError
