import { Elysia, t } from 'elysia'
import { agnosticAuthPlugin } from '@/plugins/agnosticAuthPlugin'
import { getDoctorReferralByIdAndUserDoctorId } from '@/repositories/doctorReferrals.repository'

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
