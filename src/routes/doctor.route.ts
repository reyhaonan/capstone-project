import { Elysia, t } from 'elysia'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import {
	createDoctor,
	getDoctorByEmail,
	getDoctorById,
} from '@/repositories/doctors.repository'
import { createDoctorSchema } from '@/types/doctors.types'
import { getExpTimestamp } from '@/utils'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { Role } from '@/types/enums/role.enum'
import { dbModel } from '@/db/model'
import { doctorAuthPlugin } from '@/plugins/doctorAuthPlugin'

const { doctors } = dbModel.insert

export const doctorRoutes = new Elysia({
	prefix: '/doctor',
	name: 'Doctor',
	detail: { tags: ['Doctor'] },
})
	.use(jwtPlugin)
	.post(
		'/register',
		async ({ body }) => {
			const password = await Bun.password.hash(body.password, {
				algorithm: 'bcrypt',
				cost: 10,
			})

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
				doctor.password,
				'bcrypt'
			)
			if (!passwordMatch)
				return status('Unauthorized', 'Invalid email or password')

			const accessJWTToken = await accessJWT.sign({
				sub: doctor.doctorId,
				exp: getExpTimestamp(ACCESS_TOKEN_EXP),
				role: Role.USER,
			})
			accessToken.set({
				value: accessJWTToken,
				maxAge: ACCESS_TOKEN_EXP,
			})

			const refreshJWTToken = await refreshJWT.sign({
				sub: doctor.doctorId,
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

	.use(doctorAuthPlugin)

	.get('/me', ({ doctor }) => {
		return {
			message: 'Doctor information retrieved successfully',
			data: {
				user: {
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
