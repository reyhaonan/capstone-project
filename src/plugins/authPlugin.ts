import { Elysia } from 'elysia'
import { getUserById } from '@/repositories/users.repository'
import { jwtPlugin } from '@/plugins/jwtPlugin'

const authPlugin = (app: Elysia) =>
	app
		.use(jwtPlugin)
		.derive(async ({ accessJWT, cookie: { accessToken }, error }) => {
			if (!accessToken.value) {
				// handle error for access token is not available
				return error('Unauthorized', 'Access token is missing')
			}
			const jwtPayload = await accessJWT.verify(accessToken.value)
			if (!jwtPayload) {
				// handle error for access token is tempted or incorrect
				return error('Forbidden', 'Access token is invalid')
			}

			const userId = jwtPayload.sub

			if (!userId) {
				// handle error for userId is not available
				return error('Unauthorized', 'User ID is missing')
			}

			const user = await getUserById(userId)

			if (!user) {
				// handle error for user not found from the provided access token
				return error('Forbidden', 'User not found')
			}

			return {
				user,
			}
		})

export { authPlugin }
