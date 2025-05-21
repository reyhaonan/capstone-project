import { Elysia, t } from 'elysia'
import {
	createDoctorReferral,
	getDoctorReferralById,
	getDoctorReferralsByUserOrDoctorId,
} from '@/repositories/doctorReferrals.repository'
import { doctorAuthPlugin } from '@/plugins/doctorAuthPlugin'
import { createDoctorReferralSchema } from '@/types/schema/doctorReferral.schema'
import { agnosticAuthPlugin } from '@/plugins/agnosticAuthPlugin'

export const referralRoutes = new Elysia({
	prefix: '/referral',
	name: 'Doctor Referrals',
	detail: { tags: ['Doctor Referrals'] },
})

	// Doctor or user can access this route
	.group('', (app) =>
		app.use(agnosticAuthPlugin).get(
			'/referrals',
			async ({ params: { referralId }, id }) => {
				const referrals = await getDoctorReferralsByUserOrDoctorId(id)

				if (!referrals)
					return {
						message: 'Referral not found',
						data: null,
					}
				return {
					message: 'Referral information retrieved successfully',
					data: {
						...referrals,
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

	// Anyone can access this route
	.group('', (app) =>
		app.get(
			'/:referralId',
			async ({ params: { referralId } }) => {
				const [referral] = await getDoctorReferralById(referralId)

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
				const [result] = await createDoctorReferral({
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
				body: t.Omit(createDoctorReferralSchema, ['doctorId']),
			}
		)
	)
