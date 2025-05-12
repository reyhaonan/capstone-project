import { db } from '@/db'
import { table } from '@/db/schema'
import { createDoctorSchema } from '@/types/doctors.types'
import { and, eq, ilike, SQL } from 'drizzle-orm'
import { searchDoctorsSchema } from '@/types/users.types'

export const createDoctor = async (
	doctor: typeof createDoctorSchema.static
) => {
	return db.insert(table.doctors).values(doctor)
}

export const getDoctorByEmail = async (email: string) => {
	return db.query.doctors.findFirst({
		where: eq(table.doctors.email, email),
	})
}

export const getDoctorById = async (doctorId: string) => {
	return db.query.doctors.findFirst({
		where: eq(table.doctors.doctorId, doctorId),
	})
}

export const searchDoctors = async ({
	name,
	specialization,
	page = 1,
	perPage = 10,
}: typeof searchDoctorsSchema.static) => {
	const filters: SQL[] = []

	if (name) filters.push(ilike(table.doctors.name, name))
	if (specialization)
		filters.push(eq(table.doctors.specialization, specialization))

	return db
		.select()
		.from(table.doctors)
		.where(and(...filters))
		.limit(perPage)
		.offset((page - 1) * perPage)
}
