import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { useFetchAPI } from '../../../Hooks/useAPI';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { GetCookie } from '../../../Utils/util-functions';

const Home = () => {

    const appState = useSelector(state => state);
    console.log(appState);
    
    const onDetailSuccess = res => {
       console.log(res);
    }

    let detailsApi = useFetchAPI("LoginApi", `/user/${appState?.userInfo?.localId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onDetailSuccess));
    const fetching = detailsApi?.Loading || detailsApi?.Fetching;

    return (
        <div>Homedssds</div>
    )
}

export default Home