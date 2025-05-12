import {
	boolean,
	date,
	foreignKey,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'
import { doctorSpecialization } from '@/types/enums/specialization.enum'

const time = {
	createdAt: timestamp('created_at', {
		precision: 0,
		withTimezone: true,
	}).defaultNow(),
	updatedAt: timestamp('updated_at', {
		precision: 0,
		withTimezone: true,
	}).defaultNow(),
}

export const users = pgTable('users', {
	userId: uuid('user_id').primaryKey().defaultRandom(),
	name: varchar('name').notNull(),
	email: varchar('email').unique().notNull(),
	password: varchar('password').notNull(),
	phoneNumber: varchar('phone_number').notNull(),
	dateOfBirth: date('date_of_birth').notNull(),
	address: text('address'),
	...time,
})

export const doctorSpecializationEnum = pgEnum(
	'doctor_specialization',
	doctorSpecialization
)

export const doctors = pgTable('doctors', {
	doctorId: uuid('doctor_id').primaryKey().defaultRandom(),
	name: varchar('name').notNull(),
	specialization: doctorSpecializationEnum('specialization').notNull(),
	licenseNumber: varchar('license_number').notNull(),
	email: varchar('email').unique().notNull(),
	phoneNumber: varchar('phone_number').notNull(),
	hospitalAffiliation: varchar('hospital_affiliation'),
	password: varchar('password').notNull(),
	...time,
})

export const statusEnum = pgEnum('status', ['ONGOING', 'CLOSED'])

export const usersDoctors = pgTable(
	'users_doctors',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.userId),
		doctorId: uuid('doctor_id')
			.notNull()
			.references(() => doctors.doctorId),
		status: statusEnum('status').notNull().default('ONGOING'),
		...time,
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.doctorId] }),
		unique('users_doctors_unique').on(table.userId, table.doctorId),
	]
)

export const chats = pgTable(
	'chats',
	{
		chatId: uuid('chat_id').notNull().defaultRandom().primaryKey(),
		userId: uuid('user_id').notNull(),
		doctorId: uuid('doctor_id').notNull(),
		message: text('message').notNull(),
		isFromDoctor: boolean('is_from_doctor').notNull(),
		...time,
	},
	(table) => [
		foreignKey({
			columns: [table.userId, table.doctorId],
			foreignColumns: [usersDoctors.userId, usersDoctors.doctorId],
		}),
		unique('chats_unique').on(table.chatId, table.doctorId, table.userId),
	]
)

export const doctorReferrals = pgTable(
	'doctor_referrals',
	{
		referralId: uuid('referral_id').defaultRandom().primaryKey(),
		userId: uuid('user_id').notNull(),
		doctorId: uuid('doctor_id').notNull(),
		referralReason: text('referral_reason').notNull(),
		referralDate: date('referral_date').notNull(),
		notes: text('notes').notNull(),
		...time,
	},
	(table) => [
		foreignKey({
			columns: [table.userId, table.doctorId],
			foreignColumns: [usersDoctors.userId, usersDoctors.doctorId],
		}),
		unique('doctor_referrals_unique').on(
			table.referralId,
			table.doctorId,
			table.userId
		),
	]
)

export const table = {
	users,
	doctors,
	usersDoctors,
	chats,
	doctorReferrals,
} as const

export type Table = typeof table
