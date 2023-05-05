import Express from 'express'
import { User } from '@prisma/client'

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

export interface TypedRequestUser extends Express.Request {
  user: User | null
}
