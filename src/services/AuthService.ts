import fetch from '@/api/FetchInterceptor';

import { HttpMethods } from '@/types/custom';
import { components } from '@/types/generated';

export const AuthService = {
    refresh_token: (data: any) => {
        return fetch({
            url: `/auth/refresh`,
            method: HttpMethods.POST,
            params: data,
        })
    }
        ,

    signIn: (data: components['schemas']['UserLoginBase']) =>
        fetch({
            url: '/auth/login',
            method: HttpMethods.POST,
            params: data,
        }),

    signUp: (data: components['schemas']['UserLoginBase']) =>
        fetch({
            url: '/auth/sign-up/',
            method: HttpMethods.POST,
            data: data,
        }),

    getMe: () =>
        fetch({
            url: '/auth/me/',
            method: HttpMethods.GET,
        }),
};
