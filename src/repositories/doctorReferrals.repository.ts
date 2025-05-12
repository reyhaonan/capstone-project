import { db } from '@/db'
import { table } from '@/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { createDoctorSchema } from '@/types/schema/doctorReferral.schema'

export const getDoctorReferralByIdAndUserDoctorId = async (
	referralId: string,
	id: string
) => {
	return db.query.doctorReferrals.findFirst({
		where: and(
			eq(table.doctorReferrals.referralId, referralId),
			or(
				eq(table.doctorReferrals.userId, id),
				eq(table.doctorReferrals.doctorId, id)
			)
		),
	})
}

export const createDoctorReferral = async (
	body: typeof createDoctorSchema.static
) => {
	return db.insert(table.doctorReferrals).values(body).returning()
}
