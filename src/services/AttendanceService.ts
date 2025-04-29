import fetch from '@/api/FetchInterceptor'
import { API_BASE_URL } from '@/configs/AppConfig'

import { HttpMethods } from '@/types/custom'
import { paths } from '@/types/generated'

export const AttendanceService = {
	getAttendanceByDays: (
		params: any
	) =>
		fetch({
			url: `http://${localStorage.getItem('selected') }:8080/attendance_dashboard/`,
			method: HttpMethods.GET,
			params: params.query,
		}),

	getAttendanceByDaysDetails: (
		params: any
	) =>
		{
			return fetch({
				url: `http://${localStorage.getItem('selected') }:8080/dashboard/is_late/list`,
				method: HttpMethods.GET,
				params: params,
			})
		},

	getAttendanceByEmployees: (
		params: any
	) => {
		return fetch({
			url: `${API_BASE_URL}/attendance_dashboard/${params.id}`,
			method: HttpMethods.GET,
			params: params.query,
		})
	},

	getAttendanceByEmployeesId: (
		params: any
	) =>
		fetch({
			url: `/attendance/by-employees/${params.path.employeeId}`,
			method: HttpMethods.GET,
			params: params.path,
		}),
}
