import Express from 'express'
import { TypedRequestBody } from '../helpers/typedRequestBody'
import { prisma } from '../../prisma'
import { invalidCredentialsError, invalidInputDataError, serverError, userAlreadyExistsError } from '../helpers/errors'
import { z } from 'zod'
import { getHashedPassword, verifyPassword } from '../helpers/encryptPassword'
import { getJwtToken } from '../helpers/getJwtToken'

// @desc    Creates a new account using name, email and password
// @route   POST /user/create-account
// @access  Public
// @input   {name: string, email: string, password: string}
// @output  {user: User, token: string, success: boolean, error: string}
export const createUserAccount = async (req: TypedRequestBody<{ name: string, email: string, password: string }>, res: Express.Response): Promise<void> => {
  const { name, email, password } = req.body

  try {
    if (!z.string().min(3).safeParse(name).success || !z.string().email().safeParse(email).success || !z.string().min(6).safeParse(password).success) {
      res.status(200).json({
        success: false,
        error: invalidInputDataError
      })
    } else {
      const userExists = await prisma.user.findUnique({
        where: {
          email
        }
      })

      if (userExists !== null) {
        res.status(200).json({
          success: false,
          error: userAlreadyExistsError
        })
      } else {
        const hashedPassword = await getHashedPassword(password)

        const user = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword
          },
          include: {
            medicines: true
          }
        })
        user.password = ''

        const token = getJwtToken(user.id)

        res.status(200).json({
          success: true,
          token,
          user
        })
      }
    }
  } catch (error) {
    res.status(200).json({
      success: false,
      error: error
    })
  }
}

// @desc    Logs into users account using email and password
// @route   POST /user/login
// @access  Public
// @input   {email: string, password: string}
// @output  {user: User, token: string, success: boolean, error: string}
export const login = async (req: TypedRequestBody<{ email: string, password: string }>, res: Express.Response): Promise<void> => {
  const { email, password } = req.body

  try {
    if (!z.string().email().safeParse(email).success || !z.string().min(6).safeParse(password).success) {
      res.status(200).json({
        success: false,
        error: invalidInputDataError
      })
    } else {
      const user = await prisma.user.findUnique({
        where: {
          email
        },
        include: {
          medicines: true
        }
      })

      if (user === null || !await verifyPassword(password, user.password)) {
        res.status(200).json({
          success: false,
          error: invalidCredentialsError
        })
      } else {
        user.password = ''

        const token = getJwtToken(user.id)

        res.status(200).json({
          success: true,
          token,
          user
        })
      }
    }
  } catch (error) {
    res.status(200).json({
      success: false,
      error: serverError
    })
  }
}
