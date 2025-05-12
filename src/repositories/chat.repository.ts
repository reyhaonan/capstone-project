import { db } from '@/db'
import { table } from '@/db/schema'
import { createChatSchema } from '@/types/schema/chats.schema'

export const createChat = async (body: typeof createChatSchema.static) => {
	return db.insert(table.chats).values(body).returning()
}
