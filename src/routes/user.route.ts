import { Elysia, t } from 'elysia'
import { dbModel } from '@/db/model'
import { createUser, getUserByEmail, getUserById } from '@/repositories/users'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { getExpTimestamp } from '@/utils'
import { createUserSchema } from '@/types/users.typebox'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import { Role } from '@/types/role.enum'

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
			set,
		}) => {
			const user = await getUserByEmail(body.email)

			if (!user) {
				set.status = 'Unauthorized'
				return { message: 'Invalid email or password' }
			}

			const passwordMatch = await Bun.password.verify(
				body.password,
				user.password,
				'bcrypt'
			)
			if (!passwordMatch) {
				set.status = 'Unauthorized'
				return { message: 'Invalid email or password' }
			}

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
			set,
		}) => {
			if (!refreshToken.value) {
				set.status = 'Unauthorized'
				return { message: 'Refresh token is missing' }
			}

			const jwtPayload = await refreshJWT.verify(refreshToken.value)
			if (!jwtPayload) {
				set.status = 'Unauthorized'
				return { message: 'Refresh token is invalid' }
			}

			const userId = jwtPayload.sub
			if (!userId) {
				set.status = 'Unauthorized'
				return { message: 'User ID is missing' }
			}

			const user = await getUserById(userId)
			if (!user) {
				set.status = 'Unauthorized'
				return { message: 'User not found' }
			}

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
	.post('/logout', async ({ cookie: { accessToken, refreshToken } }) => {
		accessToken.remove()
		refreshToken.remove()

		return {
			message: 'Logout successful',
		}
	})
