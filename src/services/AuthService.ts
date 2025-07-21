import fetch from '@/api/FetchInterceptor'

import { HttpMethods } from '@/types/custom'
import { components } from '@/types/generated'

export const AuthService = {
	refresh_token: (data: any) => {
		return fetch({
			url: `/auth/refresh`,
			method: HttpMethods.POST,
			params: data,
		})
	},
	signIn: (data: components['schemas']['UserLoginBase']) =>
		fetch({
			url: '/auth/login',
			method: HttpMethods.POST,
			params: data,
		}),

	reg2FA: (data: { username: string }) =>
		fetch({
			url: '/auth/2fa/qr',
			method: HttpMethods.GET,
			params: data,
		}),

	verify2FA: (data: { username: string; code: string | number }) =>
		fetch({
			url: '/auth/2fa/verify',
			method: HttpMethods.POST,
			params: data,
		}),

	confirm2FA: (data: { username: string; code: string; temp_secret: string }) =>
		fetch({
			url: '/auth/2fa/confirm',
			method: HttpMethods.POST,
			params: data,
		}),

	check2FA: (data: { username: string }) =>
		fetch({
			url: '/auth/check_auth',
			method: HttpMethods.GET,
			params: data,
		}),

	signUp: (data: components['schemas']['UserLoginBase']) =>
		fetch({
			url: '/auth/sign-up/',
			method: HttpMethods.POST,
			data: data,
		}),

	getMe: () =>
		fetch({
			url: '/auth/me/',
			method: HttpMethods.GET,
		}),
}
