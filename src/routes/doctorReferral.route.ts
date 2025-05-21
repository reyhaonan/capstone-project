import { Elysia, t } from 'elysia'
import {
	getDoctorReferralById,
	getDoctorReferralsByUserOrDoctorId,
} from '@/repositories/doctorReferrals.repository'
import { agnosticAuthPlugin } from '@/plugins/agnosticAuthPlugin'

export const referralRoutes = new Elysia({
	prefix: '/referral',
	name: 'Doctor Referrals',
	detail: { tags: ['Doctor Referrals'] },
})

	// Doctor or user can access this route
	.group('', (app) =>
		app.use(agnosticAuthPlugin).get(
			'',
			async ({ id }) => {
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
