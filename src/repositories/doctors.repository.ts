import { db } from '@/db'
import { table } from '@/db/schema'
import { createDoctorSchema } from '@/types/doctors.types'
import { eq } from 'drizzle-orm'

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
