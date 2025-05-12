import { Elysia } from 'elysia'
import jwt from '@elysiajs/jwt'
import { db } from '@/db'
import { table } from '@/db/schema'
import { eq } from 'drizzle-orm'

const authPlugin = (app: Elysia) =>
	app
		.use(
			jwt({
				name: 'jwt',
				secret: Bun.env.JWT_SECRET!,
			})
		)
		.derive(async ({ jwt, cookie: { accessToken, role }, set }) => {
			if (!accessToken.value) {
				// handle error for access token is not available
				set.status = 'Unauthorized'
				throw new Error('Access token is missing')
			}
			const jwtPayload = await jwt.verify(accessToken.value)
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

			const user = await db
				.selectDistinct()
				.from(table.users)
				.where(eq(table.users.userId, userId))

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
