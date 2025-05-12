import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { doctorReferrals } = dbModel.insert

export const createDoctorSchema = t.Object({
	userId: doctorReferrals.userId,
	referralReason: doctorReferrals.referralReason,
	referralDate: doctorReferrals.referralDate,
	notes: doctorReferrals.notes,
})
