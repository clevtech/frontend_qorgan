import fetch from '@/api/FetchInterceptor'

import { HttpMethods } from '@/types/custom.ts'
import { components, paths } from '@/types/generated.ts'

export const EmployeeService = {
	createEmployeesChild: (data: any) =>
		fetch({
			url: '/global/child',
			method: HttpMethods.POST,
			data: data,
		}),

	createEmployeesParent: (data: any) =>
		fetch({
			url: '/global/parent',
			method: HttpMethods.POST,
			data: data,
		}),

	deleteEmployeesParent: (id: string | number) => 
		fetch({
			url: `/global/parent/${id}`,
			method: HttpMethods.DELETE,
		}),
	deleteEmployeesChild: (id: string | number) => 
		fetch({
			url: `/global/child/${id}`,
			method: HttpMethods.DELETE,
		}),

	getEmployeesChild: (params: paths['/api/employees/']['get']['parameters']) =>
		fetch({
			url: '/global/child',
			method: HttpMethods.GET,
		}),

	getEmployeesParent: (params: paths['/api/employees/']['get']['parameters']) =>
		fetch({
			url: '/global/parent',
			method: HttpMethods.GET,
		}),

	updateEmployeesParent:(id: string | number, data: string) =>
		fetch({
			url: `/global/parent/${id}`,
			method: HttpMethods.PATCH,
			data: data,
		}),

	updateEmployeesChild:(id: string | number, data: string) =>
		fetch({
			url: `/global/child/${id}`,
			method: HttpMethods.PATCH,
			data: data,
		}),

	getEmployeesById: (
		params: paths['/api/employees/{id}/']['get']['parameters']
	) =>
		fetch({
			url: `/employees/${params.path.id}/`,
			method: HttpMethods.GET,
		}),

	updateEmployeesById: (
		params: paths['/api/employees/{id}/']['put']['parameters'],
		data: components['schemas']['EmployeeUpdate']
	) =>
		fetch({
			url: `/user/${params.path.id}/`,
			method: HttpMethods.PUT,
			data: data,
		}),

	deleteEmployeesById: (
		params: paths['/api/employees/{id}/']['delete']['parameters']
	) =>
		fetch({
			url: `/user/?user_id=${params.path.id}`,
			method: HttpMethods.DELETE,
		}),

    
}
