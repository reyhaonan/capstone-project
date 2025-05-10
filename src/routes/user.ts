import { Elysia, t } from 'elysia'
import { db } from '@/db/model'
import jwt from '@elysiajs/jwt'

const { users } = db.insert

export const userRoutes = new Elysia({
	prefix: '/user',
	name: 'User',
	detail: { tags: ['User'] },
})
	.use(
		jwt({
			name: 'authJwt',
			secret: process.env.JWT_SECRET,
		})
	)
	.post('/register', ({ body }) => {}, {
		body: t.Object({
			name: users.name,
			email: users.email,
			password: users.password,
			phoneNumber: users.phoneNumber,
			dateOfBirth: users.dateOfBirth,
			address: users.address,
		}),
	})
	.post('/login', ({ authJwt, body, cookie: { auth } }) => {}, {
		body: t.Object({
			email: users.email,
			password: users.password,
		}),
	})
