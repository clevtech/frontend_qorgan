import {HttpMethods} from '@/types/custom.ts';

import fetch from '@/api/FetchInterceptor';
import {components, paths} from "@/types/generated.ts";

export const TransportService = {
    createTransport: (data: components['schemas']['TransportCreate']) =>
        fetch({
            url: '/transport/transport/',
            method: HttpMethods.POST,
            data: data
        }),

    getTransports: (params: paths['/api/transports/']['get']['parameters']) =>
        fetch<components['schemas']['TransportsRead']>({
            url: '/transport/transport/',
            method: HttpMethods.GET,
            params: params.query
        }),

    getTransportById: (params: paths['/api/transports/{id}/']['get']['parameters']) =>
        fetch({
            url: `/transport/transport/${params.path.id}/`,
            method: HttpMethods.GET
        }),

    updateTransportById: (params: paths['/api/transports/{id}/']['put']['parameters'], data: components['schemas']['TransportUpdate']) =>
        fetch({
            url: `/transport/transport/${params.path._id}`,
            method: HttpMethods.PATCH,
            data: data
        }),

    deleteTransportById: (params: paths['/api/transports/{id}/']['delete']['parameters']) =>
        fetch({
            url: `/transport/transport/${params.path._id}`,
            method: HttpMethods.DELETE
        })
}
