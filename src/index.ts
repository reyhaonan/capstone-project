import { Elysia } from 'elysia'
import { userRoutes } from './routes/users.route'
import { doctorRoutes } from './routes/doctors.route'
import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { referralRoutes } from '@/routes/doctorReferral.route'

const app = new Elysia({
	sanitize: (value) => Bun.escapeHTML(value),
})
	.use(cors())
	.use(
		swagger({
			path: '/docs',
		})
	)
	.use(userRoutes)
	.use(doctorRoutes)
	.use(referralRoutes)
	.listen(3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
