import { db } from '@/db'
import { table } from '@/db/schema'
import { desc, eq, or } from 'drizzle-orm'
import { createDoctorReferralSchema } from '@/types/schema/doctorReferral.schema'

export const getDoctorReferralById = async (referralId: string) => {
	return db
		.select({
			referralId: table.doctorReferrals.referralId,
			referralDate: table.doctorReferrals.referralDate,
			referralReason: table.doctorReferrals.referralReason,
			notes: table.doctorReferrals.notes,
			createdAt: table.doctorReferrals.createdAt,
			doctorId: table.doctorReferrals.doctorId,
			userId: table.doctorReferrals.userId,
			doctorName: table.doctors.name,
			userName: table.users.name,
		})
		.from(table.doctorReferrals)
		.where(eq(table.doctorReferrals.referralId, referralId))
		.leftJoin(table.users, eq(table.users.userId, table.doctorReferrals.userId))
		.leftJoin(
			table.doctors,
			eq(table.doctors.doctorId, table.doctorReferrals.doctorId)
		)
		.limit(1)
}

export const getDoctorReferralsByUserOrDoctorId = async (id: string) => {
	return db
		.select({
			referralId: table.doctorReferrals.referralId,
			referralDate: table.doctorReferrals.referralDate,
			referralReason: table.doctorReferrals.referralReason,
			notes: table.doctorReferrals.notes,
			createdAt: table.doctorReferrals.createdAt,
			doctorId: table.doctorReferrals.doctorId,
			userId: table.doctorReferrals.userId,
			doctorName: table.doctors.name,
			userName: table.users.name,
		})
		.from(table.doctorReferrals)
		.where(
			or(
				eq(table.doctorReferrals.userId, id),
				eq(table.doctorReferrals.doctorId, id)
			)
		)
		.leftJoin(table.users, eq(table.users.userId, table.doctorReferrals.userId))
		.leftJoin(
			table.doctors,
			eq(table.doctors.doctorId, table.doctorReferrals.doctorId)
		)
		.orderBy(desc(table.doctorReferrals.createdAt))
}

export const createDoctorReferral = async (
	body: typeof createDoctorReferralSchema.static
) => {
	return db
		.insert(table.doctorReferrals)
		.values({
			...body,
			referralDate: body.referralDate.toISOString(),
		})
		.returning()
}
