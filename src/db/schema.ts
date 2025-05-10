import {
	boolean,
	date,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	userId: uuid('user_id').primaryKey().defaultRandom(),
	firstName: varchar('first_name'),
	lastName: varchar('last_name'),
	email: varchar('email').notNull(),
	password: varchar('password').notNull(),
	phoneNumber: varchar('phone_number'),
	dateOfBirth: date('date_of_birth'),
	address: text('address'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export const doctors = pgTable('doctors', {
	doctorId: uuid('doctor_id').primaryKey().defaultRandom(),
	firstName: varchar('first_name'),
	lastName: varchar('last_name'),
	specialization: varchar('specialization'),
	licenseNumber: varchar('license_number'),
	email: varchar('email').notNull(),
	phoneNumber: varchar('phone_number'),
	hospitalAffiliation: varchar('hospital_affiliation'),
	password: varchar('password').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export const statusEnum = pgEnum('status', ['ONGOING', 'CLOSED'])

export const usersDoctors = pgTable(
	'users_doctors',
	{
		userId: uuid('user_id').notNull(),
		doctorId: uuid('doctor_id').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
		status: statusEnum('status').notNull().default('ONGOING'),
	},
	(table) => [primaryKey({ columns: [table.userId, table.doctorId] })]
)
export const chats = pgTable('chats', {
	chatId: serial('chat_id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.userId),
	doctorId: uuid('doctor_id')
		.notNull()
		.references(() => doctors.doctorId),
	messageText: text('message_text'),
	isFromDoctor: boolean('is_from_doctor'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export const doctorReferrals = pgTable('doctor_referrals', {
	referralId: uuid('referral_id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.userId),
	doctorId: uuid('doctor_id')
		.notNull()
		.references(() => doctors.doctorId),
	referralReason: text('referral_reason'),
	referralDate: timestamp('referral_date'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})
