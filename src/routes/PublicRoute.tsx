import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { AUTHENTICATED_ENTRY } from '@/configs/AppConfig';
import { RootState } from '@/store';

const PublicRoute = () => {
    const { access_token } = useSelector((state: RootState) => state.auth);

    return access_token ? <Navigate to={AUTHENTICATED_ENTRY} /> : <Outlet />;
};

export default PublicRoute;
