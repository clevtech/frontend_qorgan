import fetch from '@/api/FetchInterceptor';
import { API_BASE_URL } from '@/configs/AppConfig'

import { HttpMethods } from '@/types/custom';
import { components, paths } from '@/types/generated.ts';

export const FaceCheckpointsService = {
    getFaceCheckpoints: (params: any) =>
        fetch({
            url: `http://${localStorage.getItem('selected')}:8080/attendance/`,
            method: HttpMethods.GET,
            params: params.query,
        }),

        getFaceCheckpointsById: (params: any) =>
            fetch({
                url: '/attendance/' +   params.path.id + '/',
                method: HttpMethods.GET,
            }),

    updateFaceCheckpoints: (
        params: paths['/api/attendance/{id}/']['put']['parameters'],
        data: components['schemas']['FaceCheckpointUpdate']
    ) =>
        fetch({
            url: `/attendance/${params.path.id}/`,
            method: HttpMethods.PUT,
            data: data,
        }),
};
