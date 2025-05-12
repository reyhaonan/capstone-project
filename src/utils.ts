import { selectUsersDoctorsSchema } from '@/types/schema/usersDoctors.schema'

export const getExpTimestamp = (seconds: number) => {
	const currentTimeMillis = Date.now()
	const secondsIntoMillis = seconds * 1000
	const expirationTimeMillis = currentTimeMillis + secondsIntoMillis

	return Math.floor(expirationTimeMillis / 1000)
}

export const getWebsocketTopic = ({
	userId,
	doctorId,
}: Omit<typeof selectUsersDoctorsSchema.static, 'status'>) => {
	return `chat_u:${userId}_d:${doctorId}`
}
