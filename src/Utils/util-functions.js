import * as JsCrypto from 'jscrypto';
import * as CryptoJS from 'crypto-js';
import { Envurl } from '../Envurl';
import moment from 'moment';
import ManageCookie from './cookieManager';
import refreshToken from './refreshToken';

let env = Envurl();

const encryptKey = 'Jsprep-Encrypt-Decrypt-SecretPwd';

export const RefreshToken = (env) => {
    refreshToken(env);
}

export const GetCookie = (cookieKey) => {
    return ManageCookie('get', cookieKey);
}

export const SetCookie = (cookieKey, cookieData, options = {}) => {
    ManageCookie('set', cookieKey, cookieData, options);
}

export const UpdateCookie = (cookieKey, cookieData, options = {}) => {
    ManageCookie('update', cookieKey, cookieData, options);
}

export const RemoveCookie = (cookieKey) => {
    ManageCookie('remove', cookieKey);
}

export const RemoveAllCookies = (options = {}) => {
    ManageCookie('removeAll', '', '', options)
}

export function getFormattedDate(format, date) {
    return date ? moment(date).format(format) : moment().format(format);
}

export function decryptObjData(textToDecrypt) {
    if (!textToDecrypt) {
        return textToDecrypt;
    }
    const decryptValue = JsCrypto.AES.decrypt(textToDecrypt, encryptKey.trim());
    return JSON.parse(decryptValue.toString(JsCrypto.Utf8));
}