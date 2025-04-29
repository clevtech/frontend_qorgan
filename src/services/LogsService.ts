import fetch from '@/api/FetchInterceptor'

import { HttpMethods } from '@/types/custom.ts'
import { paths } from '@/types/generated.ts'

export const LogsService = {
	getLogs: (params: any) =>
		fetch({
			url: `http://${localStorage.getItem('selected')}:8080/user/logs/`,
			method: HttpMethods.GET,
			params: params.query,
		}),
}
