import { Elysia, t } from 'elysia'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import {
	createDoctor,
	getDoctorByEmail,
	getDoctorById,
} from '@/repositories/doctors.repository'
import { createDoctorSchema } from '@/types/schema/doctors.schema'
import { getExpTimestamp, getWebsocketTopic } from '@/utils'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { Role } from '@/types/enums/role.enum'
import { dbModel } from '@/db/model'
import { doctorAuthPlugin } from '@/plugins/doctorAuthPlugin'
import {
	getUsersDoctors,
	getUsersDoctorsDetail,
	updateUsersDoctorsStatus,
} from '@/repositories/usersDoctors.repository'
import { createChat, getChatHistory } from '@/repositories/chat.repository'
import { selectChatSchema } from '@/types/schema/chats.schema'
import { MessageType } from '@/types/enums/messageType.enum'

const { doctors, usersDoctors } = dbModel.insert

export const doctorRoutes = new Elysia({
	prefix: '/doctor',
	name: 'Doctor',
	detail: { tags: ['Doctor'] },
})
	.use(jwtPlugin)
	.post(
		'/register',
		async ({ body }) => {
			const password = await Bun.password.hash(body.password)

			await createDoctor({
				name: body.name,
				email: body.email,
				password,
				phoneNumber: body.phoneNumber,
				hospitalAffiliation: body.hospitalAffiliation,
				specialization: body.specialization,
				licenseNumber: body.licenseNumber,
			})

			return {
				message: 'Doctor created successfully',
			}
		},
		{
			body: createDoctorSchema,
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
			const doctor = await getDoctorByEmail(body.email)

			if (!doctor) return status('Unauthorized', 'Invalid email or password')

			const passwordMatch = await Bun.password.verify(
				body.password,
				doctor.password
			)
			if (!passwordMatch)
				return status('Unauthorized', 'Invalid email or password')

			const accessJWTToken = await accessJWT.sign({
				sub: doctor.doctorId,
				exp: getExpTimestamp(ACCESS_TOKEN_EXP),
				role: Role.DOCTOR,
			})
			accessToken.set({
				value: accessJWTToken,
				httpOnly: true,
				sameSite: 'none',
				secure: true,
				maxAge: ACCESS_TOKEN_EXP,
			})

			const refreshJWTToken = await refreshJWT.sign({
				sub: doctor.doctorId,
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
				email: doctors.email,
				password: doctors.password,
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

			const doctorId = jwtPayload.sub
			if (!doctorId) return status('Unauthorized', 'Doctor ID is missing')

			const doctor = await getDoctorById(doctorId)
			if (!doctor) return status('Unauthorized', 'Doctor not found')

			const accessJWTToken = await accessJWT.sign({
				sub: doctor.doctorId,
				exp: getExpTimestamp(ACCESS_TOKEN_EXP),
				role: Role.DOCTOR,
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
		'/:doctorId',
		async ({ params: { doctorId } }) => {
			const doctor = await getDoctorById(doctorId)

			if (!doctor) return { message: 'Doctor not found', data: null }

			return {
				message: 'Doctor information retrieved successfully',
				data: {
					name: doctor.name,
					hospitalAffiliation: doctor.hospitalAffiliation,
					specialization: doctor.specialization,
				},
			}
		},
		{
			params: t.Object({
				doctorId: t.String(),
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
				tags: ['Authenticated Doctor'],
			},
		},
		(app) =>
			app
				.use(doctorAuthPlugin)

				.get('/me', ({ doctor }) => {
					return {
						message: 'Doctor information retrieved successfully',
						data: {
							user: {
								doctorId: doctor.doctorId,
								name: doctor.name,
								email: doctor.email,
								password: doctor.password,
								phoneNumber: doctor.phoneNumber,
								hospitalAffiliation: doctor.hospitalAffiliation,
								specialization: doctor.specialization,
								licenseNumber: doctor.licenseNumber,
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
					'/chat/:userId/history',
					async ({ params: { userId }, query, doctor }) => {
						const result = await getChatHistory({
							userId,
							doctorId: doctor.doctorId,
							...query,
						})

						return {
							message: 'Chat history retrieved successfully',
							data: result,
						}
					},
					{
						params: t.Object({
							userId: usersDoctors.userId,
						}),
						query: t.Omit(selectChatSchema, ['userId', 'doctorId']),
					}
				)

				.get('/chat/list', async ({ doctor }) => {
					const data = await getUsersDoctorsDetail({
						doctorId: doctor.doctorId,
					})

					return { message: 'Chat list retrieved successfully', data }
				})

				.ws('/chat/:userId', {
					body: t.Object({
						message: t.String(),
						messageType: t.Enum(MessageType),
					}),
					params: t.Object({
						userId: usersDoctors.userId,
					}),
					async message(ws, { message, messageType }) {
						const { doctor, params } = ws.data

						if (messageType === MessageType.CONVERSATION_END) {
							const result = await updateUsersDoctorsStatus({
								doctorId: doctor.doctorId,
								userId: params.userId,
								status: 'CLOSED',
							})

							if (!result)
								return ws.close(4002, 'Failed to update consultation status')
						}

						const [result] = await createChat({
							userId: params.userId,
							doctorId: doctor.doctorId,
							message: message,
							messageType,
							isFromDoctor: true,
						})

						const topic = getWebsocketTopic({
							userId: params.userId,
							doctorId: doctor.doctorId,
						})

						ws.send(result)
						ws.publish(topic, result)

						if (messageType === MessageType.CONVERSATION_END) {
							ws.close(4001, 'Conversation ended')
						}
					},
					close(ws) {
						const { doctor, params } = ws.data

						const topic = getWebsocketTopic({
							userId: params.userId,
							doctorId: doctor.doctorId,
						})

						ws.unsubscribe(topic)
					},
					async open(ws) {
						const { doctor, params } = ws.data

						const result = await getUsersDoctors({
							userId: params.userId,
							doctorId: doctor.doctorId,
							status: 'ONGOING',
						})

						if (!result) return ws.close(4000, 'No ongoing consultation')

						const topic = getWebsocketTopic({
							userId: params.userId,
							doctorId: doctor.doctorId,
						})

						// ws.subscribe('chat')
						ws.subscribe(topic)
					},
				})
	)
