import { Elysia } from 'elysia'
import { userRoutes } from './routes/user.route'
import { doctorRoutes } from './routes/doctor.route'
import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'

const app = new Elysia()
	.use(cors())
	.use(
		swagger({
			path: '/docs',
		})
	)
	.use(userRoutes)
	.use(doctorRoutes)
	.listen(3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
