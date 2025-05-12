import { dbModel } from '@/db/model'
import { t } from 'elysia'

const { usersDoctors } = dbModel.insert
const { usersDoctors: usersDoctorsSelect } = dbModel.select

export const createUsersDoctorsSchema = t.Object({
	userId: usersDoctors.userId,
	doctorId: usersDoctors.doctorId,
	status: usersDoctors.status,
})

export const selectUsersDoctorsSchema = t.Object({
	userId: usersDoctorsSelect.userId,
	doctorId: usersDoctorsSelect.doctorId,
	status: usersDoctorsSelect.status,
})
