import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Envurl } from '../Envurl';
import { requestUtils } from '../Utils/axios-utils';
import { GetCookie, RemoveAllCookies, SetCookie } from '../Utils/util-functions';
var moment_timezone = require('moment-timezone');
var moment = require('moment');
let envData = Envurl();

const mostCommomHeaders = {
    "accept": "application/json",
    "login-fullname": '',
    "login-usernm": '',
    "authorization": '',
    "meta-timezone": moment_timezone.tz.guess() || "Asia/Calcutta"
}

export const fetchAPI = (key) => {
    const userInfo = GetCookie('userTokenInfo');
    return requestUtils(
        {
            url: key.queryKey[1],
            method: key.queryKey[2] ? key.queryKey[2] : 'get',
            data: key.queryKey[3] ? key.queryKey[3] : '',
            responseType: key.queryKey[5] || ''
        },
        key.queryKey[4] ? { ...mostCommomHeaders, ...key.queryKey[4], ...{"login-fullname": encodeURIComponent(userInfo ? userInfo.firstNm + ", " + userInfo.lastNm : ''), "login-usernm": userInfo ? userInfo.usernm : '', "authorization": userInfo ? "Bearer " + userInfo.authToken : ''}  } : mostCommomHeaders
    )
}

const createAPI = (...inputs) => {
    const userInfo = GetCookie('userTokenInfo');
    return requestUtils(
        {
            url: inputs[0].url,
            method: inputs[0].method,
            data: inputs[0].payLoad,
            responseType: inputs[0]?.responseType || ''
        },
        inputs[0].headers ? { ...mostCommomHeaders, ...inputs[0].headers, ...{"login-fullname": encodeURIComponent(userInfo ? userInfo.firstNm + ", " + userInfo.lastNm : ''), "login-usernm": userInfo ? userInfo.usernm : '', "authorization": userInfo ? "Bearer " + userInfo.authToken : ''} } : mostCommomHeaders
    )
}
const getData = (data) => {
    let appException;
    if (data && (data.isAxiosError || data.status === 401)) {
        const resp = data.data;
        if (resp.statusCode === 401 && resp.message === "Unauthorized") {
            RemoveAllCookies();
            window.open(`${envData.reactLogoutUrl}?sessionExpired=true`, '_self');
            return null;
        }
        if (data && data.message) {
            appException = ExceptionObj('E', '500', data.message, data.message);
            console.error('Exception :' + JSON.stringify(appException));
        } else if (data && data.response && data.response.data && data.response.data.exceptions) {
            const err = data.response.data.exceptions[0];
            appException = ExceptionObj(err.type, err.code, err.message, err.detail);
            console.error('Exception :' + JSON.stringify(appException));
        }
    }
    const refreshedToken = data && data?.headers ? data?.headers['refreshToken'] || data?.headers['refreshtoken'] || '' : '';
    if (refreshedToken && !isJWTTokenExpired(refreshedToken)) {
        const userInfo = GetCookie('userTokenInfo');
        const decodeToken = parseJwt(refreshedToken);
        if(userInfo?.authToken && userInfo?.authToken.length && userInfo?.authToken !== refreshedToken && moment(new Date(decodeToken.expiresAt)).diff(moment(Math.floor((new Date()).getTime())), 'seconds') >= userInfo.idleTime - 100) {
            SetCookie('userTokenInfo', { ...userInfo, authToken: refreshedToken });
            SetCookie('tokenTimeStamp', new Date().toISOString());
        }
    }
    return data && data.data;
}

export const useFetchAPI = (queryKey, uri, methd, payLoad, appId, queryParams, responseType) => {
    const { isLoading, data, isFetching, isError, error, refetch } =
        useQuery(
            [queryKey, uri, methd, payLoad, appId, responseType],
            fetchAPI,
            queryParams
        )
    return {
        data: getData(data),
        Loading: isLoading,
        Fetching: isFetching,
        IsError: isError,
        Error: getData(error),
        refetch: refetch
    }
}

export const useCreateAPI = (queryKey) => {
    const queryClient = useQueryClient()
    return useMutation(createAPI, {
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey)
        },
        onError: (error) => {
            queryClient.ExceptionObj(error)
            console.error('Exception :' + JSON.stringify(error));
        }
    })
}


export const ExceptionObj = (type, code, message, detail) => {
    return {
        type: type,
        code: code,
        message: message,
        detail: detail
    }
}

export const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export const isJWTTokenExpired = (token) => {
    const expiry = token ? (JSON.parse(atob(token.split('.')[1]))).exp : 0;
    return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
}

