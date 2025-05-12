import { Elysia } from 'elysia'
import { authPlugin } from '@/plugins/authPlugin'

export const doctorRoutes = new Elysia({ prefix: '/doctor' }).use(authPlugin)
