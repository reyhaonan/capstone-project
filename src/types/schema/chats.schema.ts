import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { chats: chatsInsert } = dbModel.insert

export const createChatSchema = t.Object({
	userId: chatsInsert.userId,
	doctorId: chatsInsert.doctorId,
	message: chatsInsert.message,
	isFromDoctor: chatsInsert.isFromDoctor,
})
