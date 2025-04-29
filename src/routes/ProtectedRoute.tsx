import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { AUTH_PREFIX_PATH, REDIRECT_URL_KEY, UNAUTHENTICATED_ENTRY } from '@/configs/AppConfig';
import { RootState } from '@/store';

const ProtectedRoute = () => {
    const { access_token } = useSelector((state: RootState) => state.auth);

    const location = useLocation();

    if (!access_token) {
        return (
            <Navigate
                to={`${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}?${REDIRECT_URL_KEY}=${location.pathname}`}
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
