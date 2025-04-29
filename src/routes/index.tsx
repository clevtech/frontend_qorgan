import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';

import { AUTHENTICATED_ENTRY } from '@/configs/AppConfig';
import { protectedRoutes, publicRoutes } from '@/configs/RoutesConfig';

import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicRoute from '@/routes/PublicRoute';
import AppRoute from '@/routes/AppRoute';

export const Routes = () => {
    return (
        <RouterRoutes>
            <Route path='/' element={<ProtectedRoute />}>
                <Route path='/' element={<Navigate replace to={AUTHENTICATED_ENTRY} />} />
                {protectedRoutes.map((route, idx) => {
                    return <Route key={idx} path={route.path} element={<AppRoute component={route.component} />} />;
                })}
                <Route path='*' element={<Navigate to='/' replace />} />
            </Route>
            <Route path='/' element={<PublicRoute />}>
                {publicRoutes.map((route, idx) => {
                    return <Route key={idx} path={route.path} element={<AppRoute component={route.component} />} />;
                })}
            </Route>
        </RouterRoutes>
    );
};
