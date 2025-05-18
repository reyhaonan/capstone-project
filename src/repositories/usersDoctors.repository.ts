import { db } from '@/db'
import { table } from '@/db/schema'
import {
	createUsersDoctorsSchema,
	selectUsersDoctorsSchema,
} from '@/types/schema/usersDoctors.schema'
import { and, desc, eq, SQL } from 'drizzle-orm'

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

type UserDoctorFilter = { userId?: string; doctorId?: string }

export const getUsersDoctorsDetail = async ({
	userId,
	doctorId,
}: UserDoctorFilter) => {
	const latestChat = db
		.select()
		.from(table.chats)
		.orderBy(desc(table.chats.createdAt))
		.limit(1)
		.as('latestChat')

	const whereConditions: SQL[] = [] // Array to hold where conditions

	if (userId) {
		whereConditions.push(eq(table.usersDoctors.userId, userId))
	}
	if (doctorId) {
		whereConditions.push(eq(table.usersDoctors.doctorId, doctorId))
	}

	if (!userId && !doctorId) {
		throw new Error('Either userId or doctorId must be provided')
	}

	return db
		.select({
			userId: table.usersDoctors.userId,
			doctorId: table.usersDoctors.doctorId,
			status: table.usersDoctors.status,
			updatedAt: table.usersDoctors.updatedAt,
			userName: table.users.name,
			doctorName: table.doctors.name,
			latestChat: {
				chatId: latestChat.chatId,
				message: latestChat.message,
				messageType: latestChat.messageType,
				isFromDoctor: latestChat.isFromDoctor,
				createdAt: latestChat.createdAt,
			},
		})
		.from(table.usersDoctors)
		.where(and(...whereConditions))
		.leftJoin(table.users, eq(table.users.userId, table.usersDoctors.userId))
		.leftJoin(
			table.doctors,
			eq(table.doctors.doctorId, table.usersDoctors.doctorId)
		)
		.leftJoin(
			latestChat,
			and(
				eq(table.usersDoctors.userId, latestChat.userId),
				eq(table.usersDoctors.doctorId, latestChat.doctorId)
			)
		)
		.orderBy(desc(latestChat.createdAt))
}
