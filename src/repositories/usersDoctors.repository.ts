import { db } from '@/db'
import { table } from '@/db/schema'
import {
	createUsersDoctorsSchema,
	selectUsersDoctorsSchema,
} from '@/types/schema/usersDoctors.schema'
import { and, asc, eq } from 'drizzle-orm'

export const createUsersDoctorsCompositeKey = async ({
	doctorId,
	userId,
}: Omit<typeof createUsersDoctorsSchema.static, 'status'>) => {
	return db
		.insert(table.usersDoctors)
		.values({
			doctorId,
			userId,
			status: 'ONGOING',
		})
		.onConflictDoUpdate({
			target: [table.usersDoctors.doctorId, table.usersDoctors.userId],
			set: { status: 'ONGOING', updatedAt: new Date() },
		})
		.returning()
}

export const updateUsersDoctorsStatus = async (
	body: typeof createUsersDoctorsSchema.static
) => {
	return db
		.update(table.usersDoctors)
		.set({ status: body.status })
		.where(
			and(
				eq(table.usersDoctors.userId, body.userId),
				eq(table.usersDoctors.doctorId, body.doctorId)
			)
		)
		.returning()
}

export const getUsersDoctors = async (
	body: typeof selectUsersDoctorsSchema.static
) => {
	return db.query.usersDoctors.findFirst({
		where: and(
			eq(table.usersDoctors.userId, body.userId),
			eq(table.usersDoctors.doctorId, body.doctorId),
			eq(table.usersDoctors.status, body.status)
		),
	})
}

export const getUsersDoctorsByDoctorId = async (
	body: Pick<typeof selectUsersDoctorsSchema.static, 'doctorId'>
) => {
	return db.query.usersDoctors.findMany({
		where: and(eq(table.usersDoctors.doctorId, body.doctorId)),
		orderBy: asc(table.usersDoctors.updatedAt),
	})
}

export const getUsersDoctorsByUserId = async (
	body: Pick<typeof selectUsersDoctorsSchema.static, 'userId'>
) => {
	return db.query.usersDoctors.findMany({
		where: and(eq(table.usersDoctors.userId, body.userId)),
		orderBy: asc(table.usersDoctors.updatedAt),
	})
}
