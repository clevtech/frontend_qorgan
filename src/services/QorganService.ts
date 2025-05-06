import fetch from '@/api/FetchInterceptor'
import { HttpMethods } from '@/types/custom'

export const QorganService = {
	getAuto: () =>
		fetch({
			url: `/auto/`,
			method: HttpMethods.POST,
		}),

	getOff: () => {
		return fetch({
			url: `/off/`,
			method: HttpMethods.POST,
		})
	},
	getOn: () => {
		return fetch({
			url: `/on/`,
			method: HttpMethods.POST,
		})
	},

	getDetections: (params: any) => {
		return fetch({
			url: `/detections/`,
			method: HttpMethods.GET,
			params: params,
		})
	},

	getModules: (params: any) => {
		return fetch({
			url: `/modules/`,
			method: HttpMethods.GET,
			params: params,
		})
	},
}
