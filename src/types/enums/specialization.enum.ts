export enum DoctorSpecialization {
	DERMATOLOGY = 'DERMATOLOGY',
	CARDIOLOGY = 'CARDIOLOGY',
	NEUROLOGY = 'NEUROLOGY',
	PEDIATRICS = 'PEDIATRICS',
	PSYCHIATRY = 'PSYCHIATRY',
	ORTHOPEDICS = 'ORTHOPEDICS',
	GYNECOLOGY = 'GYNECOLOGY',
	OPHTHALMOLOGY = 'OPHTHALMOLOGY',
	RADIOLOGY = 'RADIOLOGY',
	ANESTHESIOLOGY = 'ANESTHESIOLOGY',
}

export const doctorSpecialization = [
	DoctorSpecialization.DERMATOLOGY,
	DoctorSpecialization.CARDIOLOGY,
	DoctorSpecialization.NEUROLOGY,
	DoctorSpecialization.PEDIATRICS,
	DoctorSpecialization.PSYCHIATRY,
	DoctorSpecialization.ORTHOPEDICS,
	DoctorSpecialization.GYNECOLOGY,
	DoctorSpecialization.OPHTHALMOLOGY,
	DoctorSpecialization.RADIOLOGY,
	DoctorSpecialization.ANESTHESIOLOGY,
] as const
