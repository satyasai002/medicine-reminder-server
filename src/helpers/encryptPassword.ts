import bcrypt from 'bcryptjs'

/// It takes in a password, then hashes the password and returns the hashed password
export const getHashedPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(password, salt)

  return hashedPassword
}

/// It takes both password and hashed password, then compares them against each other and returns a boolean if the match or not
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const verified = await bcrypt.compare(password, hashedPassword)

  return verified
}
