import { Elysia } from 'elysia'
import { getDoctorById } from '@/repositories/doctors.repository'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import { Role } from '@/types/enums/role.enum'

const doctorAuthPlugin = new Elysia()
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

			if (jwtPayload.role !== Role.DOCTOR)
				return status(
					'Unauthorized',
					'You are not allowed to consume this service'
				)

			const doctorId = jwtPayload.sub

			if (!doctorId) return status('Unauthorized', 'User ID is missing')

			const doctor = await getDoctorById(doctorId)

			if (!doctor) return status('Forbidden', 'User not found')

			return {
				doctor,
			}
		}
	)

export { doctorAuthPlugin }
