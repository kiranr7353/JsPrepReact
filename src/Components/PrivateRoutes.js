import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import { GetCookie } from '../Utils/util-functions';

const PrivateRoutes = () => {

    const userTokenInfo = useMemo(() => GetCookie('userTokenInfo'), []);

    return (
        userTokenInfo ? <Outlet /> : <Navigate to='/login' />
    )
}

export default PrivateRoutes;