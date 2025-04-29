import fetch from '@/api/FetchInterceptor';

import { HttpMethods } from '@/types/custom.ts';
import { components, paths } from '@/types/generated.ts';

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

            createEmployees: (data: any) =>
                fetch({
                    url: '/user',
                    method: HttpMethods.POST,
                    data: data,
                }),

    getEmployees: (params: paths['/api/employees/']['get']['parameters']) =>
        fetch({
            url: `http://${localStorage.getItem('selected') }:8080/user/`,
            method: HttpMethods.GET,
            params: params.query,
        }),

    getEmployeesById: (params: paths['/api/employees/{id}/']['get']['parameters']) =>
        fetch({
            url: `/employees/${params.path.id}/`,
            method: HttpMethods.GET,
        }),

    updateEmployeesById: (
        params: paths['/api/employees/{id}/']['put']['parameters'],
        data: components['schemas']['EmployeeUpdate'],
    ) =>
        fetch({
            url: `/user/?user_id=${params.path.id}`,
            method: HttpMethods.PUT,
            data: data,
        }),

    deleteEmployeesById: (params: paths['/api/employees/{id}/']['delete']['parameters']) =>
        fetch({
            url: `/user/?user_id=${params.path.id}`,
            method: HttpMethods.DELETE,
        }),
};
