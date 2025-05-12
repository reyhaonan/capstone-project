import { t } from 'elysia'
import { dbModel } from '@/db/model'
import { DoctorSpecialization } from '@/types/enums/specialization.enum'

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

export const searchDoctorsSchema = t.Partial(
	t.Object({
		name: t.String(),
		specialization: t.Enum(DoctorSpecialization),
		page: t.Number(),
		perPage: t.Number(),
	})
)
