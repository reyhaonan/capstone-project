import { Elysia } from 'elysia'
import { getUserById } from '@/repositories/users.repository'
import { jwtPlugin } from '@/plugins/jwtPlugin'
import { Role } from '@/types/enums/role.enum'
import { getDoctorById } from '@/repositories/doctors.repository'

const agnosticAuthPlugin = new Elysia({
	name: 'agnosticAuthPlugin',
})
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

			const id = jwtPayload.sub

			if (!id) return status('Unauthorized', 'ID is missing')

			if (jwtPayload.role === Role.USER) {
				const user = await getUserById(id)

				if (!user) return status('Forbidden', 'User not found')

				return { id }
			} else if (jwtPayload.role === Role.DOCTOR) {
				const doctor = await getDoctorById(id)
				if (!doctor) return status('Forbidden', 'Doctor not found')
				return { id }
			} else return status('Forbidden', 'Role not found')
		}
	)

export { agnosticAuthPlugin }
