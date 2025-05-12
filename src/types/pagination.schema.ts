import { t } from 'elysia'

export const paginationSchema = t.Object({
	page: t.Number(),
	perPage: t.Number(),
})

export type PaginationSchema = typeof paginationSchema.static
