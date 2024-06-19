import { Cookies } from 'react-cookie';

const cookie = new Cookies();
export default function ManageCookie(action, cookieKey, cookieData, options = {}) {
    const defaultOptions = { path: '/', ...options };
    const encryptCookieData =  cookieData ? encodeString(JSON.stringify(cookieData)) : '';
    let returnData = '';
    switch (action) {
        case 'get': {
            const cookieVal = cookie.get(cookieKey);
            returnData = cookieVal ? JSON.parse(decodeString(cookieVal)) : '';
            break;
        }
        case 'set': {
            cookie.set(cookieKey, encryptCookieData, defaultOptions);
            break;
        }
        case 'update': {
            cookie.remove(cookieKey, defaultOptions);
            cookie.set(cookieKey, encryptCookieData, defaultOptions);
            break;
        }
        case 'remove': {
            cookie.remove(cookieKey, defaultOptions);
            break;
        }
        case 'removeAll': {
            const allCookies = cookie.getAll(defaultOptions);
            Object.keys(allCookies).forEach(el => {
                cookie.remove(el, defaultOptions);
            });
            break;
        }
        default: break;
    }
    if (returnData) {
        return returnData;
    }
};

function encodeString(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    } catch (e) {
        console.error(e);
    }
}

function decodeString(str) {
    try {
        return decodeURIComponent(atob(str).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error(e);
    }
}