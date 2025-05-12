import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { doctorReferrals } = dbModel.insert

export const createDoctorSchema = t.Object({
	userId: doctorReferrals.userId,
	doctorId: doctorReferrals.doctorId,
	referralReason: doctorReferrals.referralReason,
	notes: doctorReferrals.notes,
})
