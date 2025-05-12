import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { table } from '@/db/schema'

export const db = drizzle(process.env.DATABASE_URL!, {
	schema: table,
})
