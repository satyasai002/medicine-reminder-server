import express from 'express'
import {
  createMedicine,
  decreaseMedicine, deleteMedicine,
  getMedicine,
  getReminder,
  getUserMedicine
} from '../controllers/medicineController'
import { isLoggedIn } from '../middleware/isLoggedIn'

export const medicineRouter = express.Router()

medicineRouter.post('/create-medicine', isLoggedIn, createMedicine)
medicineRouter.post('/decrease-medicine', decreaseMedicine)
medicineRouter.post('/get-medicine', getMedicine)
medicineRouter.post('/get-user-medicine', getUserMedicine)
medicineRouter.get('/', getReminder)
medicineRouter.post('/delete', deleteMedicine)
