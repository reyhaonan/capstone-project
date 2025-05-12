import { selectUsersDoctorsSchema } from '@/types/schema/usersDoctors.schema'

export const getExpTimestamp = (seconds: number) => {
	const currentTimeMillis = Date.now()
	const secondsIntoMillis = seconds * 1000
	const offsetMillis = 7 * 60 * 60 * 1000 // 7 hours in milliseconds
	const expirationTimeMillis =
		currentTimeMillis + secondsIntoMillis + offsetMillis

	return Math.floor(expirationTimeMillis / 1000)
}
export const getWebsocketTopic = ({
	userId,
	doctorId,
}: Omit<typeof selectUsersDoctorsSchema.static, 'status'>) => {
	return `chat_u:${userId}_d:${doctorId}`
}
