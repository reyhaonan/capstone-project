import { t } from 'elysia'
import { dbModel } from '@/db/model'
import { paginationSchema } from '@/types/schema/pagination.schema'

const { doctors: doctorsSchema } = dbModel.insert

export const createDoctorSchema = t.Object({
	name: doctorsSchema.name,
	email: doctorsSchema.email,
	password: doctorsSchema.password,
	phoneNumber: doctorsSchema.phoneNumber,
	hospitalAffiliation: doctorsSchema.hospitalAffiliation,
	specialization: doctorsSchema.specialization,
	licenseNumber: doctorsSchema.licenseNumber,
})

export const searchDoctorsSchema = t.Composite([
	paginationSchema,
	t.Partial(
		t.Object({
			name: doctorsSchema.name,
			specialization: doctorsSchema.specialization,
		})
	),
])
