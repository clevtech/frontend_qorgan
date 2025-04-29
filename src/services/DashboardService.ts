import fetch from '@/api/FetchInterceptor'

import { HttpMethods } from '@/types/custom.ts'
import { paths } from '@/types/generated.ts'

export const DashboardService = {
	getDashboard: (params: any) =>
		fetch({
			url: `http://${localStorage.getItem(
				'selected'
			)}:8080/dashboard/all_attendance`,
			method: HttpMethods.GET,
			params: params.query
		}),

	getDashboardAttandance: (
		params: any
	) =>
		fetch({
			url: `http://${localStorage.getItem(
				'selected'
			)}:8080/dashboard/attendance_by_day`,
			method: HttpMethods.GET,
			params: params.query
		}),

	getExitTransports: (params: any) =>
		fetch({
			url: `http://${localStorage.getItem(
				'selected'
			)}:8080/dashboard/exit_transports`,
			method: HttpMethods.GET,
			params: params.query
		}),

	getEnterTransports: (params: any) =>
		fetch({
			url: `http://${localStorage.getItem(
				'selected'
			)}:8080/dashboard/enter_transports`,
			method: HttpMethods.GET,
			params: params.query
		}),

	getConfigs: () =>
		fetch({
			url: '/dashboard/configs/',
			method: HttpMethods.GET,
		}),
}
