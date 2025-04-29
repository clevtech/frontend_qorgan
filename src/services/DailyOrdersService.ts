import { HttpMethods } from '@/types/custom.ts';

import fetch from '@/api/FetchInterceptor';
import { components, paths } from '@/types/generated.ts';

export const DailyOrdersService = {
    createDailyOrders: (data: components['schemas']['DailyOrderCreate']) =>
        fetch({
            url: '/daily-orders/',
            method: HttpMethods.POST,
            data: data,
        }),

    getDailyOrders: (params: paths['/api/daily-orders/']['get']['parameters']) =>
        fetch<components['schemas']['DailyOrdersRead']>({
            url: '/daily-orders/',
            method: HttpMethods.GET,
            params: params.query,
        }),

    getDailyOrdersById: (params: paths['/api/daily-orders/{id}/']['get']['parameters']) =>
        fetch({
            url: `/daily-orders/${params.path.id}/`,
            method: HttpMethods.GET,
        }),

    updateDailyOrders: (
        params: paths['/api/daily-orders/{id}/']['put']['parameters'],
        data: components['schemas']['DailyOrderUpdate'],
    ) =>
        fetch({
            url: `/daily-orders/${params.path.id}/`,
            method: HttpMethods.PUT,
            data: data,
        }),

    getWhitelistsByDailyOrderId: (params: paths['/api/daily-orders/{id}/whitelists/']['get']['parameters']) =>
        fetch<components['schemas']['WhiteListsRead']>({
            url: `/daily-orders/${params.path.id}/whitelists/`,
            method: HttpMethods.GET,
        }),
};
