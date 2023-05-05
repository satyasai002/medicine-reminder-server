import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { prisma } from '../prisma'
import { userRouter } from './routes/userRoute'
import { medicineRouter } from './routes/medicineRoute'

const connectToDatabase = async (): Promise<void> => {
  await prisma.$connect
}

dotenv.config()

connectToDatabase().then(() => {
  console.log('Successfully connected to database')
}).catch(() => {
  throw Error('Error connecting to database')
})

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/user', userRouter)
app.use('/medicine', medicineRouter)

const PORT = process.env.PORT !== undefined ? process.env.PORT : 4000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
