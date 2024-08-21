import React, { useMemo } from 'react';
import { GetCookie } from '../Utils/util-functions';
const moment_timezone = require('moment-timezone');

export const CommonHeaders = () => {
    const userTokenInfo = useMemo(() => GetCookie('userTokenInfo'), []);
    const refreshToken = useMemo(() => GetCookie('refreshToken'), []);
    const userInfo = useMemo(() => GetCookie('userInfo'), []);
    
    return {
        "email": userInfo ? userInfo.email : '',
        "Login-Fullname": userInfo ? userInfo.email : '',
        "localId": userInfo ? userInfo.localId : '',
        "Authorization": userTokenInfo ? "Bearer " + userTokenInfo : '',
        "meta-timezone": moment_timezone.tz.guess() || "Asia/Calcutta",
        "Refreshtoken": refreshToken
        // "operationid": operationId ? operationId : ''
    }
}