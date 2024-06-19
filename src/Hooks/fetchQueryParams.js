export const fetchQueryParams = (cacheTime, staleTime, refetchOnWindowFocus, enterPriseCountSuccess, enterPriseCountError, EnabledVal) => {
    return {
        cacheTime: cacheTime ? cacheTime : 300000,
        staleTime: staleTime ? staleTime : 0,
        refetchOnWindowFocus: refetchOnWindowFocus != null ? refetchOnWindowFocus ? true : false : true,
        onSuccess: enterPriseCountSuccess,
        onError: enterPriseCountError,
        enabled: EnabledVal
    }
}