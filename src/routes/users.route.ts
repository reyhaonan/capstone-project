import { Elysia, t } from 'elysia'
import { dbModel } from '@/db/model'
import {
	createUser,
	getUserByEmail,
	getUserById,
} from '@/repositories/users.repository'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { getExpTimestamp, getWebsocketTopic } from '@/utils'
import { createUserSchema } from '@/types/schema/users.schema'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import { Role } from '@/types/enums/role.enum'
import { userAuthPlugin } from '@/plugins/userAuthPlugin'
import { searchDoctors } from '@/repositories/doctors.repository'
import { searchDoctorsSchema } from '@/types/schema/doctors.schema'
import {
	createUsersDoctorsCompositeKey,
	getUsersDoctors,
	getUsersDoctorsByUserId,
} from '@/repositories/usersDoctors.repository'
import { createChat, getChatHistory } from '@/repositories/chat.repository'
import { selectChatSchema } from '@/types/schema/chats.schema'
import { MessageType } from '@/types/enums/messageType.enum'

const { users, usersDoctors } = dbModel.insert

export const userRoutes = new Elysia({
	prefix: '/user',
	name: 'User',
	detail: { tags: ['User'] },
})
	.use(jwtPlugin)

	.post(
		'/register',
		async ({ body }) => {
			const password = await Bun.password.hash(body.password)

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
				user.password
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
				httpOnly: true,
				sameSite: 'none',
				secure: true,
				maxAge: ACCESS_TOKEN_EXP,
			})

			const refreshJWTToken = await refreshJWT.sign({
				sub: user.userId,
				exp: getExpTimestamp(REFRESH_TOKEN_EXP),
			})

			refreshToken.set({
				value: refreshJWTToken,
				httpOnly: true,
				sameSite: 'none',
				secure: true,
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
				httpOnly: true,
				sameSite: 'none',
				secure: true,
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
	.group(
		'',
		{
			detail: {
				description: 'Authenticated routes',
				tags: ['Authenticated User'],
			},
		},
		(app) =>
			app
				.use(userAuthPlugin)

				.get(
					'/search-doctors',
					async ({ query }) => {
						const { data, total } = await searchDoctors(query)

						return {
							data,
							total,
						}
					},
					{
						query: searchDoctorsSchema,
					}
				)

				.post(
					'/initiate-consultation',
					async ({ body: { doctorId }, user }) => {
						const [result] = await createUsersDoctorsCompositeKey({
							doctorId,
							userId: user.userId,
						})

						if (result) {
							return {
								message: 'Consultation initiated successfully',
							}
						}
					},
					{
						body: t.Object({
							doctorId: usersDoctors.doctorId,
						}),
					}
				)

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

				.get(
					'/chat/:doctorId/history',
					async ({ params: { doctorId }, query, user }) => {
						const result = await getChatHistory({
							userId: user.userId,
							doctorId: doctorId,
							...query,
						})

						return {
							message: 'Chat history retrieved successfully',
							data: result,
						}
					},
					{
						params: t.Object({
							doctorId: usersDoctors.doctorId,
						}),
						query: t.Omit(selectChatSchema, ['userId', 'doctorId']),
					}
				)

				.get('/chat/list', async ({ user }) => {
					const data = await getUsersDoctorsByUserId({
						userId: user.userId,
					})

					return { message: 'Chat list retrieved successfully', data }
				})

				.ws('/chat/:doctorId', {
					body: t.Object({
						message: t.String(),
					}),
					params: t.Object({
						doctorId: usersDoctors.doctorId,
					}),
					async message(ws, { message }) {
						const { user, params } = ws.data

						const [result] = await createChat({
							userId: user.userId,
							doctorId: params.doctorId,
							message: message,
							messageType: MessageType.TEXT,
							isFromDoctor: false,
						})

						const topic = getWebsocketTopic({
							userId: user.userId,
							doctorId: params.doctorId,
						})

						ws.send(result)
						// ws.publish('chat', message)
						ws.publish(topic, result)
					},
					close(ws) {
						const { user, params } = ws.data

						const topic = getWebsocketTopic({
							userId: user.userId,
							doctorId: params.doctorId,
						})

						ws.unsubscribe(topic)
					},
					async open(ws) {
						const { user, params } = ws.data

						const result = await getUsersDoctors({
							userId: user.userId,
							doctorId: params.doctorId,
							status: 'ONGOING',
						})

						if (!result) return ws.close(4000, 'No ongoing consultation')

						const topic = getWebsocketTopic({
							userId: user.userId,
							doctorId: params.doctorId,
						})

						// ws.subscribe('chat')
						ws.subscribe(topic)
					},
				})
	)
