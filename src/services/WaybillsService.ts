import {HttpMethods} from '@/types/custom.ts';

import fetch from '@/api/FetchInterceptor';
import {components, paths} from '@/types/generated.ts';

export const WaybillsService = {
    createWaybills: (data: components['schemas']['WaybillCreate']) =>
        fetch({
            url: '/waybills/',
            method: HttpMethods.POST,
            data: data
        }),

    getWaybills: (params: paths['/api/waybills/']['get']['parameters']) =>
        fetch({
            url: '/waybills/',
            method: HttpMethods.GET,
            params: params.query
        }),

    getWaybillsById: (params: paths['/api/waybills/{id}/']['get']['parameters']) =>
        fetch({
            url: `/waybills/${params.path.id}/`,
            method: HttpMethods.GET,
            params: params.path
        }),

    updateWaybills: (params: paths['/api/waybills/{id}/']['put']['parameters'], data: components['schemas']['WaybillUpdate']) =>
        fetch({
            url: `/waybills/${params.path.id}/`,
            method: HttpMethods.PUT,
            data: data
        }),

    deleteWaybills: (params: paths['/api/waybills/{id}/']['delete']['parameters']) =>
        fetch({
            url: `/waybills/${params.path.id}/`,
            method: HttpMethods.DELETE
        }),
}
