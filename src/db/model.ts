import { table } from './schema'
import { spreads } from './utils'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export const dbModel = {
	insert: spreads(
		{
			...table,
			users: createInsertSchema(table.users, {
				email: t.String({ format: 'email' }),
			}),
			doctors: createInsertSchema(table.doctors, {
				email: t.String({ format: 'email' }),
			}),
		},
		'insert'
	),
	select: spreads(
		{
			...table,
			users: createSelectSchema(table.users, {
				email: t.String({ format: 'email' }),
			}),
			doctors: createSelectSchema(table.doctors, {
				email: t.String({ format: 'email' }),
			}),
		},
		'select'
	),
} as const
