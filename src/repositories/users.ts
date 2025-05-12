import { t } from 'elysia'
import { dbModel } from '@/db/model'
import { db } from '@/db'
import { table } from '@/db/schema'

const { users } = dbModel.insert

const createUserSchema = t.Object({
	name: users.name,
	email: users.email,
	password: users.password,
	phoneNumber: users.phoneNumber,
	dateOfBirth: users.dateOfBirth,
	address: users.address,
})

export const createUser = async (user: typeof createUserSchema.static) => {
	return db.insert(table.users).values(user)
}
