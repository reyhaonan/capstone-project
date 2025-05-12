import { Elysia } from 'elysia'
import { authPlugin } from '@/plugins/authPlugin'

export const chatRoutes = new Elysia({ prefix: '/chat' }).use(authPlugin)
