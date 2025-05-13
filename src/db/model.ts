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
				dateOfBirth: t.Date(),
			}),
			doctors: createInsertSchema(table.doctors, {
				email: t.String({ format: 'email' }),
			}),
			doctorReferrals: createInsertSchema(table.doctorReferrals, {
				referralDate: t.Date(),
			}),
		},
		'insert'
	),
	select: spreads(
		{
			...table,
			users: createSelectSchema(table.users, {
				email: t.String({ format: 'email' }),
				dateOfBirth: t.Date(),
			}),
			doctors: createSelectSchema(table.doctors, {
				email: t.String({ format: 'email' }),
			}),
			doctorReferrals: createSelectSchema(table.doctorReferrals, {
				referralDate: t.Date(),
			}),
		},
		'select'
	),
} as const
