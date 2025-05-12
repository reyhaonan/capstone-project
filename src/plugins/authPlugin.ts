import { Elysia } from 'elysia'
import { getUserById } from '@/repositories/users'
import { jwtPlugin } from '@/plugins/jwtPlugin'

const authPlugin = new Elysia()
	.use(jwtPlugin)
	.derive(async ({ accessJWT, cookie: { accessToken }, set }) => {
		if (!accessToken.value) {
			// handle error for access token is not available
			set.status = 'Unauthorized'
			throw new Error('Access token is missing')
		}
		const jwtPayload = await accessJWT.verify(accessToken.value)
		if (!jwtPayload) {
			// handle error for access token is tempted or incorrect
			set.status = 'Forbidden'
			throw new Error('Access token is invalid')
		}

		const userId = jwtPayload.sub

		if (!userId) {
			// handle error for userId is not available
			set.status = 'Unauthorized'
			throw new Error('User ID is missing')
		}

		const user = await getUserById(userId)

		if (!user) {
			// handle error for user not found from the provided access token
			set.status = 'Forbidden'
			throw new Error('Access token is invalid')
		}

		return {
			user,
		}
	})

export { authPlugin }
