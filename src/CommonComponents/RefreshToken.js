
import Axios from 'axios';
import { Envurl } from '../Envurl';
import { GetCookie, RemoveAllCookies, SetCookie } from '../Utils/util-functions';
const moment_timezone = require('moment-timezone');

let envData = Envurl();
export function RefreshToken({ userInfo }) {
    let payload = {}
    SetCookie('tokenTimeStamp', new Date().toISOString());
    return Axios({
        method: 'POST',
        url: envData.apiURL + 'user/refreshToken?__hideLoader=1',
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": "Bearer " + userInfo.authToken,
            "login-fullname": encodeURIComponent(userInfo.lastNm + ", " + userInfo.firstNm),
            "login-usernm": userInfo.usernm,
            "meta-timezone": moment_timezone.tz.guess() || "Asia/Calcutta"
        },
        data: payload,
    })
        .then(response => {
            if (response.data && response.data.token) {
                userInfo.authToken = response.data.token;
                SetCookie('tokenTimeStamp', new Date().toISOString());
            }
            return response;
        }).catch(error => {
            let errors = error.response && error.response.data;
            if (error.isAxiosError && errors.statusCode === 401) {
                let isRedirect = GetCookie('isRedirect');
                let isRedirectFromReact = GetCookie('isRedirectFromReact');
                RemoveAllCookies();
                window.open(isRedirect ? `${envData.logoutUrl}?sessionExpired=true` : isRedirectFromReact ? `${envData.reactLogoutUrl}?sessionExpired=true` : `${envData.reactLogoutUrl}?sessionExpired=true`, '_self');
            }
        });
}