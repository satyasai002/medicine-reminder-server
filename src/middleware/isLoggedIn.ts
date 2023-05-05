import Express from 'express'
import jwt from 'jsonwebtoken'
import { unauthorizedError } from '../helpers/errors'
import { prisma } from '../../prisma'

export const isLoggedIn = async (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> => {
  try {
    const authorizationHeaders = req.headers.authorization
    if (((authorizationHeaders?.startsWith('Bearer')) ?? false) && authorizationHeaders !== undefined) {
      const token = authorizationHeaders.split(' ')[1]

      if (token !== null && process.env.JWT_SECRET !== undefined) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userID: string }

        req.user = await prisma.user.findUnique({
          where: {
            id: decodedToken.userID
          }
        })

        next()
      } else {
        res.status(401).json({
          success: false,
          error: unauthorizedError
        })
      }
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      error: unauthorizedError
    })
  }
}
