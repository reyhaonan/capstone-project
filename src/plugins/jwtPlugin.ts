import jwt from '@elysiajs/jwt'
import { getExpTimestamp } from '@/utils'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/constants'
import { Elysia, t } from 'elysia'
import { Role } from '@/types/enums/role.enum'

export const jwtPlugin = new Elysia()
	.use(
		jwt({
			name: 'accessJWT',
			secret: process.env.JWT_SECRET,
			schema: t.Object({
				role: t.Enum(Role),
			}),
			exp: getExpTimestamp(ACCESS_TOKEN_EXP),
		})
	)
	.use(
		jwt({
			name: 'refreshJWT',
			secret: process.env.JWT_SECRET,
			exp: getExpTimestamp(REFRESH_TOKEN_EXP),
		})
	)
