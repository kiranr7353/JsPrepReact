import axios from 'axios';
import { Envurl } from '../Envurl';
let envData = Envurl();


const instance = axios.create({
    baseURL: envData.apiURL
})

export const requestUtils = ({ ...options }, headers) => {
    instance.defaults.headers.common = {
        ...headers
    }
    if (options.responseType) instance.defaults.responseType = options.responseType;
    const onSuccess = (response) => {
        return response
    }
    const onError = (error) => {
        return error.response
    }
    return instance(options).then(onSuccess).catch(onError);
}
