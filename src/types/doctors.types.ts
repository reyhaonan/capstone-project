import { t } from 'elysia'
import { dbModel } from '@/db/model'

const { doctors } = dbModel.insert

export const createDoctorSchema = t.Object({
	name: doctors.name,
	email: doctors.email,
	password: doctors.password,
	phoneNumber: doctors.phoneNumber,
	hospitalAffiliation: doctors.hospitalAffiliation,
	specialization: doctors.specialization,
	licenseNumber: doctors.licenseNumber,
})
