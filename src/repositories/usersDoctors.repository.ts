import { db } from '@/db'
import { table } from '@/db/schema'
import {
	createUsersDoctorsSchema,
	selectUsersDoctorsSchema,
} from '@/types/schema/usersDoctors.schema'
import { and, desc, eq, sql, SQL } from 'drizzle-orm'

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
	const whereConditions: SQL[] = []

	if (userId) {
		whereConditions.push(eq(table.usersDoctors.userId, userId))
	}
	if (doctorId) {
		whereConditions.push(eq(table.usersDoctors.doctorId, doctorId))
	}

	if (!userId && !doctorId) {
		throw new Error('Either userId or doctorId must be provided')
	}

	const latestChatCTE = db.$with('latest_chat_cte').as(
		db
			.select({
				chatId: table.chats.chatId,
				message: table.chats.message,
				messageType: table.chats.messageType,
				isFromDoctor: table.chats.isFromDoctor,
				createdAt: table.chats.createdAt,
				userId: table.chats.userId,
				doctorId: table.chats.doctorId,

				rn: sql`ROW_NUMBER() OVER (PARTITION BY ${table.chats.userId}, ${table.chats.doctorId} ORDER BY ${table.chats.createdAt} DESC)`.as(
					'rn'
				),
			})
			.from(table.chats)
	)

	return db
		.with(latestChatCTE)
		.select({
			userId: table.usersDoctors.userId,
			doctorId: table.usersDoctors.doctorId,
			status: table.usersDoctors.status,
			updatedAt: table.usersDoctors.updatedAt,
			userName: table.users.name,
			doctorName: table.doctors.name,
			latestChat: {
				chatId: latestChatCTE.chatId,
				message: latestChatCTE.message,
				messageType: latestChatCTE.messageType,
				isFromDoctor: latestChatCTE.isFromDoctor,
				createdAt: latestChatCTE.createdAt,
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
			latestChatCTE,
			and(
				eq(table.usersDoctors.userId, latestChatCTE.userId),
				eq(table.usersDoctors.doctorId, latestChatCTE.doctorId),
				eq(latestChatCTE.rn, 1)
			)
		)
		.orderBy(desc(latestChatCTE.createdAt))
}
