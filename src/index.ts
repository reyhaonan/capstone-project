import { Elysia } from 'elysia'
import { websocketRoutes } from './routes/websocket.route'
import { chatRoutes } from './routes/chat.route'
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
	.use(websocketRoutes)
	.use(chatRoutes)
	.use(userRoutes)
	.use(doctorRoutes)
	.listen(3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
