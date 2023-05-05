import express from 'express'
import { createUserAccount, login } from '../controllers/userControllers'

export const userRouter = express.Router()

userRouter.post('/create-account', createUserAccount)
userRouter.post('/login', login)
