import { TypeBoxError } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { env as bunEnv } from 'bun'
import { t } from 'elysia'

const EnvSchema = t.Object({
	DATABASE_URL: t.String(),
	JWT_SECRET: t.String(),
})

let env = EnvSchema.static

try {
	env = Value.Parse(EnvSchema, bunEnv)
} catch (e) {
	if (e instanceof TypeBoxError) {
		const errors = Value.Errors(EnvSchema, bunEnv)
		const error = errors.First()
		const envValue = error?.path
		throw new Error(
			`env error ${error?.message}: ${envValue?.replace('/', '')}`
		)
	}
	throw e
}
type SafeEnv = typeof env

declare global {
	namespace NodeJS {
		interface ProcessEnv extends SafeEnv {}
	}
}
