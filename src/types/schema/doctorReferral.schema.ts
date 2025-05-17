import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { doctorReferrals } = dbModel.insert

export const createDoctorReferralSchema = t.Object({
	userId: doctorReferrals.userId,
	doctorId: doctorReferrals.doctorId,
	referralReason: doctorReferrals.referralReason,
	referralDate: doctorReferrals.referralDate,
	notes: doctorReferrals.notes,
})
