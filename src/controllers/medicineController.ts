import Express from 'express'
import { TypedRequestBody } from '../helpers/typedRequestBody'
import { invalidInputDataError, serverError, unauthorizedError } from '../helpers/errors'
import { z } from 'zod'
import { prisma } from '../../prisma'

// @desc    Creates a new medicine for a particular user using name, compartment, number of pills and time
// @route   POST /medicine/create-medicine
// @access  Private
// @input   {name: string, compartment: number, number: number, time: string[]}
// @output  {medicine: Medicine, success: boolean}
export const createMedicine = async (req: TypedRequestBody<{ name: string, compartment: number, number: number, time: string[] }>, res: Express.Response): Promise<void> => {
  const { name, compartment, number, time } = req.body
  const userID = req.user?.id

  if (userID === undefined) {
    res.status(401).json({
      success: false,
      error: unauthorizedError
    })
  } else {
    try {
      if (!z.string().min(3).safeParse(name).success || !z.number().min(1).safeParse(compartment).success || !z.number().min(0).max(30).safeParse(number).success || !z.array(z.string()).min(1).max(3).safeParse(time).success) {
        res.status(400).json({
          success: false,
          error: invalidInputDataError
        })
      } else {
        await prisma.medicine.deleteMany({
          where: {
            compartment
          }
        })

        const medicine = await prisma.medicine.create({
          data: {
            name,
            compartment,
            number,
            time,
            userID
          }
        })

        res.status(200).json({ medicine, success: true })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: serverError
      })
    }
  }
}

// @desc    Decreases the amount of medicine by 1
// @route   POST /medicine/decrease-medicine
// @access  Private
// @input   {userID: string, compartment: number}
// @output  {success: boolean}
export const decreaseMedicine = async (req: TypedRequestBody<{ userID: string, compartment: number }>, res: Express.Response): Promise<void> => {
  const { userID, compartment } = req.body

  try {
    if (!z.string().min(10).safeParse(userID).success || !z.number().min(1).max(3).safeParse(compartment).success) {
      res.status(400).json({
        success: false,
        error: invalidInputDataError
      })
    } else {
      const previousData = await prisma.medicine.findFirst({
        where: {
          userID,
          compartment
        }
      })

      if (previousData !== null) {
        await prisma.medicine.update({
          where: {
            id: previousData.id
          },
          data: {
            number: previousData.number - 1
          }
        })

        await prisma.reminder.create({
          data: {
            compartment: previousData.compartment
          }
        })

        res.status(200).json({
          success: true
        })
      } else {
        res.status(400).json({
          success: false,
          error: invalidInputDataError
        })
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: serverError
    })
  }
}

export const getMedicine = async (req: TypedRequestBody<{ id: string }>, res: Express.Response): Promise<void> => {
  const { id } = req.body

  try {
    if (!z.string().safeParse(id).success) {
      res.status(400).json({
        success: false,
        error: invalidInputDataError
      })
    } else {
      const medicines = await prisma.user.findUnique({
        where: {
          id
        },
        include: {
          medicines: true
        }
      })

      if (medicines !== null) {
        res.status(200).json({
          success: true,
          medicine: medicines.medicines.map((value) => {
            return {
              compartment: value.compartment,
              time: value.time
            }
          })
        })
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: serverError
    })
  }
}

export const getUserMedicine = async (req: TypedRequestBody<{ id: string }>, res: Express.Response): Promise<void> => {
  const { id } = req.body

  try {
    if (!z.string().safeParse(id).success) {
      res.status(400).json({
        success: false,
        error: invalidInputDataError
      })
    } else {
      const medicines = await prisma.user.findUnique({
        where: {
          id
        },
        include: {
          medicines: true
        }
      })

      if (medicines !== null) {
        res.status(200).json({
          success: true,
          medicine: medicines.medicines.map((value) => {
            return {
              id: value.id,
              name: value.name,
              userID: value.userID,
              number: value.number,
              compartment: value.compartment,
              time: value.time
            }
          })
        })
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: serverError
    })
  }
}

export const getReminder = async (_req: Express.Request, res: Express.Response): Promise<void> => {
  const reminders = await prisma.reminder.findMany()

  res.status(200).json({
    success: true,
    reminders
  })
}

export const deleteMedicine = async (req: TypedRequestBody<{ compartment: number }>, res: Express.Response): Promise<void> => {
  const compartment = req.body.compartment

  await prisma.medicine.deleteMany({
    where: {
      compartment
    }
  })

  res.status(200).json({
    deleted: true
  })
}
