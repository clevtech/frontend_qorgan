import fetch from '@/api/FetchInterceptor'
import { HttpMethods } from '@/types/custom'

export const QorganService = {
	getAuto: () =>
		fetch({
			url: `/backend/auto/`,
			method: HttpMethods.POST,
		}),

	getOff: () => {
		return fetch({
			url: `/backend/off/`,
			method: HttpMethods.POST,
		})
	},
	getOn: () => {
		return fetch({
			url: `/backend/on/`,
			method: HttpMethods.POST,
		})
	},

	getDetections: (params: any) => {
		return fetch({
			url: `/backend/detections/`,
			method: HttpMethods.GET,
			params: params,
		})
	},

	getModules: (params: any) => {
		return fetch({
			url: `/backend/modules/`,
			method: HttpMethods.GET,
			params: params,
		})
	},
}
