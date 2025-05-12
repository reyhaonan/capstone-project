import { dbModel } from '@/db/model'
import { t } from 'elysia'

const { usersDoctors } = dbModel.insert

export const createUsersDoctorsSchema = t.Object({
	userId: usersDoctors.userId,
	doctorId: usersDoctors.doctorId,
	status: usersDoctors.status,
})
