import { ErrorCode, ERRORS } from "./errors"

type AppError = Error & {
  statusCode: number
  code: ErrorCode
  details?: any
}

export const appError = (
  code: ErrorCode,
  overrideMessage?: string,
  details?: any
): AppError => {
  const base = ERRORS[code]

  const err = new Error(overrideMessage ?? base.message) as AppError
  err.code = code
  err.statusCode = base.statusCode
  err.details = details

  return err
}
