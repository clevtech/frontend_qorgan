import fetch from '@/api/FetchInterceptor';

import { HttpMethods } from '@/types/custom.ts';
import { paths } from '@/types/generated.ts';

export const TransportTrackingService = {
    getTransportTrackings: (params: paths['/api/transport-tracking/']['get']['parameters']) =>
        fetch({
            url: '/transport-tracking/',
            method: HttpMethods.GET,
            params: params.query,
        }),
};
