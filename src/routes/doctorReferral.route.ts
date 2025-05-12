import { Elysia, t } from 'elysia'
import { agnosticAuthPlugin } from '@/plugins/agnosticAuthPlugin'
import {
	createDoctorReferral,
	getDoctorReferralByIdAndUserDoctorId,
} from '@/repositories/doctorReferrals.repository'
import { doctorAuthPlugin } from '@/plugins/doctorAuthPlugin'
import { createDoctorSchema } from '@/types/schema/doctorReferral.schema'

export const referralRoutes = new Elysia({
	prefix: '/referral',
	name: 'Doctor Referrals',
	detail: { tags: ['Doctor Referrals'] },
})

	// Doctor or user can access this route
	.group('', (app) =>
		app.use(agnosticAuthPlugin).get(
			'/:referralId',
			async ({ params: { referralId }, id }) => {
				const referral = await getDoctorReferralByIdAndUserDoctorId(
					referralId,
					id
				)

				if (!referral)
					return {
						message: 'Referral not found',
						data: null,
					}
				return {
					message: 'Referral information retrieved successfully',
					data: {
						...referral,
					},
				}
			},
			{
				params: t.Object({
					referralId: t.String(),
				}),
				detail: {
					description: 'Only relevant user or doctor can fetch the referral',
				},
			}
		)
	)

	.group('', (app) =>
		app.use(doctorAuthPlugin).post(
			'/create',
			async ({ body, doctor, status }) => {
				const result = await createDoctorReferral({
					...body,
					doctorId: doctor.doctorId,
				})

				if (!result) status('Conflict', 'Referral already exists')

				return {
					message: 'Referral created successfully',
					data: result,
				}
			},
			{
				body: t.Omit(createDoctorSchema, ['doctorId']),
			}
		)
	)
