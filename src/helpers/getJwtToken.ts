import jwt from 'jsonwebtoken'

export const getJwtToken = (userID: string): string => {
  if (process.env.JWT_SECRET !== undefined) {
    return jwt.sign({ userID }, process.env.JWT_SECRET)
  } else {
    throw Error('JWT_SECRET is undefined')
  }
}
