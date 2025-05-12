import { Elysia } from 'elysia'
import { authPlugin } from '@/plugins/authPlugin'

export const websocketRoutes = new Elysia().use(authPlugin).ws('/ws', {
	message(ws, message) {
		ws.send(message)
	},
})
