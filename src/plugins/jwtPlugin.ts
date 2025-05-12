import jwt from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'
import { Role } from '@/types/enums/role.enum'

export const jwtPlugin = new Elysia()
	.use(
		jwt({
			name: 'accessJWT',
			secret: process.env.JWT_SECRET,
			schema: t.Object({
				sub: t.String(),
				role: t.Enum(Role),
			}),
			exp: '5m',
		})
	)
	.use(
		jwt({
			name: 'refreshJWT',
			secret: process.env.JWT_SECRET,
			exp: '7d',
		})
	)
