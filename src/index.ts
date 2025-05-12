import { Elysia } from 'elysia'
import { websocketRoutes } from './routes/websocket'
import { chatRoutes } from './routes/chat'
import { userRoutes } from './routes/user'
import { doctorRoutes } from './routes/doctor'
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
