import Axios from "axios";
import * as moment_timezone from 'moment-timezone';
import ManageCookie from "./cookieManager";

export default function refreshToken(env) {
    return new Promise((resolve,reject) => {
        let authInfo =  ManageCookie('get', 'userTokenInfo');
        let refreshToken =  ManageCookie('get', 'refreshToken');
        const payload = { 
            grant_type: "refresh_token",
            refresh_token: refreshToken
        };
        ManageCookie('set', 'tokenTimeStamp', new Date().toISOString());
        Axios({
            method: 'POST',
            url: `https://securetoken.googleapis.com/v1/token?key=AIzaSyAcZjxtVxKuaNoeClWKeh8Luk8g2NMjhZ8`,
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            },
            data: payload
        })
        .then(response => {
            if (response.data && response.data.access_token) {
                authInfo.authToken = response.data.access_token;
                ManageCookie('set', 'userTokenInfo', authInfo);
                ManageCookie('set', 'tokenTimeStamp', new Date().toISOString());
            }
            resolve(response);
        }).catch(error => {
            const errors = error.response && error.response.data;
            if (error.isAxiosError && errors.statusCode === 401) {
                ManageCookie('removeAll');
                window.open(`${env.reactLogoutUrl}?sessionExpired=true`, '_self');
            }
        });
    });
}