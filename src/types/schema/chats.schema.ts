import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { chats: chatsInsert } = dbModel.insert
const { chats: chatsSelect } = dbModel.select

export const createChatSchema = t.Object({
	userId: chatsInsert.userId,
	doctorId: chatsInsert.doctorId,
	message: chatsInsert.message,
	messageType: chatsInsert.messageType,
	isFromDoctor: chatsInsert.isFromDoctor,
})

export const selectChatSchema = t.Object({
	userId: chatsSelect.userId,
	doctorId: chatsSelect.doctorId,
	endDate: t.Optional(t.Date()),
	startDate: t.Optional(t.Date()),
})
