import { HttpMethods } from '@/types/custom.ts'

import fetch from '@/api/FetchInterceptor'
import { ACCESS_TOKEN } from '@/constants/AuthConstant'
import { components, paths } from '@/types/generated.ts'
import axios from 'axios'

export const IncidentsService = {
	createIncidents: (data: components['schemas']['IncidentCreate']) =>
		fetch({
			url: '/incidents/',
			method: HttpMethods.POST,
			data: data,
		}),

	getIncidents: (params: unknown) => {
		let queryesStr: string = ``

		let query = params.query

		for (const key in query) {
			if (query[key]) {
				queryesStr += `${key}=${query[key]}&`
			}
		}

		let url = `http://${localStorage.getItem(
			'selected'
		)}:8080/incidents/incident?`

		return axios.get(url + queryesStr, {
			headers: {
				Authorization: localStorage.getItem(ACCESS_TOKEN)
					? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
					: undefined,
			},
		})
	},

	getIncidentsExcel: (params: unknown) => {
		let queryesStr: string = ``

		let query = params.query

		for (const key in query) {
			if (query[key]) {
				queryesStr += `${key}=${query[key]}&`
			}
		}

		let url = `http://${localStorage.getItem(
			'selected'
		)}:8080/incidents/excel/?`

		return axios.get(url + queryesStr, {
			responseType: 'blob',
			headers: {
				Authorization: localStorage.getItem(ACCESS_TOKEN)
					? `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
					: undefined,
			},
		})
	},

	getIncidentsTypes: (params: paths['/api/incidents/']['get']['parameters']) =>
		fetch({
			url: '/incidents/incident-types/',
			method: HttpMethods.GET,
		}),

		getIncidentsForPDF: (params: any) =>
			fetch({
				url: `/incidents/incident/frames_for_pdf/${params.id}`,
				method: HttpMethods.GET,
			}),

	getIncidentsById: (
		params: paths['/api/incidents/{id}/']['get']['parameters']
	) =>
		fetch({
			url: `/incidents/incident/${params.path.id}`,
			method: HttpMethods.GET,
		}),

	updateIncidents: (
		params: paths['/api/incidents/{id}/']['put']['parameters'],
		data: components['schemas']['IncidentUpdate']
	) =>
		fetch({
			url: `/incidents/incident/${params.path.id}`,
			method: HttpMethods.PUT,
			data: data,
		}),

	deleteIncidents: (
		params: paths['/api/incidents/{id}/']['delete']['parameters']
	) =>
		fetch({
			url: `/incidents/incident/${params.path.id}`,
			method: HttpMethods.DELETE,
		}),
}
