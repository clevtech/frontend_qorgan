import { HttpMethods } from '@/types/custom.ts';

import fetch from '@/api/FetchInterceptor';
import { components, paths } from '@/types/generated.ts';

export const WhitelistService = {
    createWhitelist: (data: components['schemas']['WhiteListCreate']) =>
        fetch({
            url: '/whitelists/',
            method: HttpMethods.POST,
            data: data,
        }),

    getWhitelists: (params: paths['/api/whitelists/']['get']['parameters']) =>
        fetch<components['schemas']['WhiteListsRead']>({
            url: '/whitelists/',
            method: HttpMethods.GET,
            params: params.query,
        }),

    getWhitelistById: (params: paths['/api/whitelists/{id}/']['get']['parameters']) =>
        fetch({
            url: `/whitelists/${params.path.id}/`,
            method: HttpMethods.GET,
            params: params.path,
        }),

    getWhitelistByOrderId: (params: paths['/api/whitelists/daily-order/{dailyOrderId}/']['get']['parameters']) =>
        fetch({
            url: `/whitelists/${params.path.dailyOrderId}/`,
            method: HttpMethods.GET,
            params: params.path,
        }),

    updateWhitelistById: (
        params: paths['/api/whitelists/{id}/']['put']['parameters'],
        data: components['schemas']['WhiteListUpdate'],
    ) =>
        fetch({
            url: `/whitelists/${params.path.id}/`,
            method: HttpMethods.PUT,
            data: data,
        }),

    deleteWhitelist: (params: paths['/api/whitelists/{id}/']['delete']['parameters']) =>
        fetch({
            url: `/whitelists/${params.path.id}/`,
            method: HttpMethods.DELETE,
        }),
};
