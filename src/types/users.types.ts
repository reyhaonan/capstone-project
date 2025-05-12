import { t } from 'elysia'
import { dbModel } from '@/db/model'
import { DoctorSpecialization } from '@/types/enums/specialization.enum'

const { users } = dbModel.insert

export const createUserSchema = t.Object({
	name: users.name,
	email: users.email,
	password: users.password,
	phoneNumber: users.phoneNumber,
	dateOfBirth: users.dateOfBirth,
	address: users.address,
})

export const searchDoctorsSchema = t.Partial(
	t.Object({
		name: t.String(),
		specialization: t.Enum(DoctorSpecialization),
		page: t.Number(),
		perPage: t.Number(),
	})
)
