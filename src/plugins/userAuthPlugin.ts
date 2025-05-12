import { Elysia } from 'elysia'
import { getUserById } from '@/repositories/users.repository'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import { Role } from '@/types/enums/role.enum'

const userAuthPlugin = new Elysia()
	.use(jwtPlugin)
	.derive(
		{ as: 'scoped' },
		async ({
			accessJWT,
			cookie: { accessToken },
			headers: { authorization },
			status,
		}) => {
			if (!accessToken.value && !authorization)
				return status('Unauthorized', 'Access token is missing')

			const token = accessToken.value || authorization!.replace('Bearer ', '')

			const jwtPayload = await accessJWT.verify(token)
			if (!jwtPayload) return status('Forbidden', 'Access token is invalid')

			if (jwtPayload.role !== Role.USER)
				return status(
					'Forbidden',
					'You are not allowed to consume this service'
				)

			const userId = jwtPayload.sub

			if (!userId) return status('Unauthorized', 'User ID is missing')

			const user = await getUserById(userId)

			if (!user) return status('Forbidden', 'User not found')

			return {
				user,
			}
		}
	)

export { userAuthPlugin }
