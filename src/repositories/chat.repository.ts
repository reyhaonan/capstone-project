import { db } from '@/db'
import { table } from '@/db/schema'
import { createChatSchema, selectChatSchema } from '@/types/schema/chats.schema'
import { and, asc, eq, gte, lte, SQL } from 'drizzle-orm'

export const getChatHistory = async (query: typeof selectChatSchema.static) => {
	const dateFilters: SQL[] = []

	if (query.startDate) {
		dateFilters.push(gte(table.chats.createdAt, query.startDate))
	}

	dateFilters.push(lte(table.chats.createdAt, query.endDate || new Date()))

	return db.query.chats.findMany({
		where: and(
			eq(table.chats.userId, query.userId),
			eq(table.chats.doctorId, query.doctorId),
			...(dateFilters.length > 0 ? [...dateFilters] : [])
		),
		orderBy: asc(table.chats.createdAt),
	})
}

export const createChat = async (body: typeof createChatSchema.static) => {
	return db.insert(table.chats).values(body).returning()
}
