import { db } from '@/db'
import { table } from '@/db/schema'
import {
	createDoctorSchema,
	searchDoctorsSchema,
} from '@/types/schema/doctors.schema'
import { and, count, eq, ilike, SQL } from 'drizzle-orm'

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

	const [{ total }] = await db
		.select({ total: count() })
		.from(table.doctors)
		.where(and(...filters))

	const data = await db
		.select({
			doctorId: table.doctors.doctorId,
			name: table.doctors.name,
			specialization: table.doctors.specialization,
			licenseNumber: table.doctors.licenseNumber,
			email: table.doctors.email,
			hospitalAffiliation: table.doctors.hospitalAffiliation,
			createdAt: table.doctors.createdAt,
		})
		.from(table.doctors)
		.where(and(...filters))
		.limit(perPage)
		.offset((page - 1) * perPage)

	return { total, data }
}
