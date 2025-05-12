import { db } from '@/db'
import { table } from '@/db/schema'
import { createUserSchema } from '@/types/schema/users.schema'
import { eq } from 'drizzle-orm'

export const createUser = async (user: typeof createUserSchema.static) => {
	return db.insert(table.users).values(user)
}

export const getUserByEmail = async (email: string) => {
	return db.query.users.findFirst({
		where: eq(table.users.email, email),
	})
}

export const getUserById = async (userId: string) => {
	return db.query.users.findFirst({
		where: eq(table.users.userId, userId),
	})
}
