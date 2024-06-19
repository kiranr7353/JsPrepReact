import Axios from "axios";
import * as moment_timezone from 'moment-timezone';
import ManageCookie from "./cookieManager";

export default function refreshToken(env) {
    return new Promise((resolve,reject) => {
        const payload = {};
        let authInfo =  ManageCookie('get', 'userTokenInfo');
        ManageCookie('set', 'tokenTimeStamp', new Date().toISOString());
        Axios({
            method: 'POST',
            url: `${env.apiURL}user/refreshToken`,
            headers: {
                "content-type": "application/json",
                "accept": "application/json",
                "authorization": "Bearer " + authInfo.authToken,
                "login-fullname": authInfo.lastNm + ", " + authInfo.firstNm,
                "login-usernm": authInfo.usernm,
                "meta-timezone": moment_timezone.tz.guess()
            },
            data: payload
        })
        .then(response => {
            if (response.data && response.data.token) {
                authInfo.authToken = response.data.token;
                ManageCookie('set', 'userTokenInfo', authInfo);
                ManageCookie('set', 'tokenTimeStamp', new Date().toISOString());
            }
            resolve(response);
        }).catch(error => {
            const errors = error.response && error.response.data;
            if (error.isAxiosError && errors.statusCode === 401) {
                let isRedirect = ManageCookie('get', 'isRedirect');
                let isRedirectFromReact = ManageCookie('get', 'isRedirectFromReact');
                ManageCookie('removeAll');
                window.open(isRedirect ? `${env.logoutUrl}?sessionExpired=true` : isRedirectFromReact ? `${env.reactLogoutUrl}?sessionExpired=true` : `${env.reactLogoutUrl}?sessionExpired=true`, '_self');
            }
        });
    });
}