import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { users } = dbModel.insert

export const createUserSchema = t.Object({
	name: users.name,
	email: users.email,
	password: users.password,
	phoneNumber: users.phoneNumber,
	dateOfBirth: users.dateOfBirth,
	address: users.address,
})
