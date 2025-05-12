import { Elysia } from 'elysia'

export const websocketRoutes = new Elysia().ws('/ws', {
	message(ws, message) {
		ws.send(message)
	},
})
