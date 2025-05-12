import { Elysia, t } from 'elysia'
import { dbModel } from '@/db/model'
import {
	createUser,
	getUserByEmail,
	getUserById,
} from '@/repositories/users.repository'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { getExpTimestamp } from '@/utils'
import { createUserSchema } from '@/types/users.types'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import { Role } from '@/types/enums/role.enum'
import { userAuthPlugin } from '@/plugins/userAuthPlugin'

const { users } = dbModel.insert

export const userRoutes = new Elysia({
	prefix: '/user',
	name: 'User',
	detail: { tags: ['User'] },
})
	.use(jwtPlugin)
	.post(
		'/register',
		async ({ body }) => {
			const password = await Bun.password.hash(body.password, {
				algorithm: 'bcrypt',
				cost: 10,
			})

			await createUser({
				email: body.email,
				name: body.name,
				address: body.address,
				password,
				dateOfBirth: body.dateOfBirth,
				phoneNumber: body.phoneNumber,
			})

			return {
				message: 'User created successfully',
			}
		},
		{
			body: createUserSchema,
		}
	)
	.post(
		'/login',
		async ({
			accessJWT,
			refreshJWT,
			body,
			cookie: { accessToken, refreshToken },
			status,
		}) => {
			const user = await getUserByEmail(body.email)

			if (!user) return status('Unauthorized', 'Invalid email or password')

			const passwordMatch = await Bun.password.verify(
				body.password,
				user.password,
				'bcrypt'
			)
			if (!passwordMatch)
				return status('Unauthorized', 'Invalid email or password')

			const accessJWTToken = await accessJWT.sign({
				sub: user.userId,
				exp: getExpTimestamp(ACCESS_TOKEN_EXP),
				role: Role.USER,
			})
			accessToken.set({
				value: accessJWTToken,
				maxAge: ACCESS_TOKEN_EXP,
			})

			const refreshJWTToken = await refreshJWT.sign({
				sub: user.userId,
				exp: getExpTimestamp(REFRESH_TOKEN_EXP),
			})

			refreshToken.set({
				value: refreshJWTToken,
				maxAge: REFRESH_TOKEN_EXP,
			})

			return {
				message: 'Login successful',
				data: {
					accessToken: accessJWTToken,
					refreshToken: refreshJWTToken,
				},
			}
		},
		{
			body: t.Object({
				email: users.email,
				password: users.password,
			}),
		}
	)

	.post(
		'/refresh',
		async ({
			cookie: { accessToken, refreshToken },
			refreshJWT,
			accessJWT,
			status,
		}) => {
			if (!refreshToken.value)
				return status('Unauthorized', 'Refresh token is missing')

			const jwtPayload = await refreshJWT.verify(refreshToken.value)
			if (!jwtPayload) return status('Unauthorized', 'Refresh token is invalid')

			const userId = jwtPayload.sub
			if (!userId) return status('Unauthorized', 'User ID is missing')

			const user = await getUserById(userId)
			if (!user) return status('Unauthorized', 'User not found')

			const accessJWTToken = await accessJWT.sign({
				sub: user.userId,
				exp: getExpTimestamp(ACCESS_TOKEN_EXP),
				role: Role.USER,
			})
			accessToken.set({
				value: accessJWTToken,
				maxAge: ACCESS_TOKEN_EXP,
			})

			return {
				message: 'Access token acquisition successful',
				data: {
					accessToken: accessJWTToken,
				},
			}
		}
	)

	.get(
		'/:userId',
		async ({ params: { userId } }) => {
			const user = await getUserById(userId)

			if (!user) return { message: 'User not found', data: null }

			return {
				message: 'User information retrieved successfully',
				data: {
					userId: user.userId,
					name: user.name,
					email: user.email,
					phoneNumber: user.phoneNumber,
					dateOfBirth: user.dateOfBirth,
					address: user.address,
					createdAt: user.createdAt,
				},
			}
		},
		{
			params: t.Object({
				userId: t.String(),
			}),
		}
	)

	// Authenticated routes
	// These routes require the user to be authenticated

	.use(userAuthPlugin)

	.get('/me', ({ user }) => {
		return {
			message: 'User information retrieved successfully',
			data: {
				user: {
					userId: user.userId,
					name: user.name,
					email: user.email,
					phoneNumber: user.phoneNumber,
					dateOfBirth: user.dateOfBirth,
					address: user.address,
					createdAt: user.createdAt,
				},
			},
		}
	})
	.post('/logout', async ({ cookie: { accessToken, refreshToken } }) => {
		accessToken.remove()
		refreshToken.remove()

		return {
			message: 'Logout successful',
		}
	})
