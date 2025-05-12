import { Elysia, t } from 'elysia'
import { dbModel } from '@/db/model'
import jwt from '@elysiajs/jwt'
import { db } from '@/db'
import { table } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createUser } from '@/repositories/users'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { getExpTimestamp } from '@/utils'

const { users } = dbModel.insert

export const userRoutes = new Elysia({
	prefix: '/user',
	name: 'User',
	detail: { tags: ['User'] },
})
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.JWT_SECRET,
			exp: '3h',
		})
	)
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
				status: 201,
				message: 'User created successfully',
			}
		},
		{
			body: t.Object({
				name: users.name,
				email: users.email,
				password: users.password,
				phoneNumber: users.phoneNumber,
				dateOfBirth: users.dateOfBirth,
				address: users.address,
			}),
		}
	)
	.post(
		'/login',
		async ({ jwt, body, cookie: { accessToken, refreshToken, role } }) => {
			const user = await db
				.selectDistinct()
				.from(table.users)
				.where(eq(table.users.email, body.email))

			if (!user) {
				return { status: 401, message: 'Invalid email or password' }
			}

			const passwordMatch = await Bun.password.verify(
				body.password,
				user[0].password,
				'bcrypt'
			)
			if (!passwordMatch) {
				return { status: 401, message: 'Invalid email or password' }
			}

			const accessJWTToken = await jwt.sign({
				sub: user[0].userId,
				exp: getExpTimestamp(ACCESS_TOKEN_EXP),
			})
			accessToken.set({
				value: accessJWTToken,
				maxAge: ACCESS_TOKEN_EXP,
			})

			const refreshJWTToken = await jwt.sign({
				sub: user[0].userId,
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
