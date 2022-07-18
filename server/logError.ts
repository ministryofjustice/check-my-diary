import { Response } from 'express'
import log from '../log'

const logError = (
  url: string,
  { response, stack, message }: { response: Response; stack?: string; message: string },
  msg: string,
) => {
  if (response) {
    const { status } = response
    log.error({ url, status, stack, message }, msg)
  } else {
    log.error({ url, stack, message }, msg)
  }
  return new Error(msg)
}

export default logError
