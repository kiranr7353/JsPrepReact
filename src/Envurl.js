export const Envurl = () => {
    //identifying environments
    let domainUrl = window.location.hostname;
    if (domainUrl.includes('uat')) {
        // return {
        //     url: domainUrl,
        //     envName: 'eksuat',
        //     apiURL: 'https://ehapp-uat.elevancehealth.com/smarthelp/smarthelpapiv2/',
        //     oAuthRedirectURL: 'https://ehapp-uat.elevancehealth.com/app/appuidashboard/home',
        //     contextPath: '/app/appuidashboard',
        //     siteUrl: 'https://ehapp-uat.elevancehealth.com/app/appuidashboard',
        //     reactLogoutUrl: 'https://ehapp-uat.elevancehealth.com/app/appuidashboard/logout',
        //     reactUAMUrl: 'https://ehapp-uat.elevancehealth.com/app/appuiuamapp/access-management',
        // };
    }
    // else if (domainUrl.includes('sit')) {
    //     return {
    //         url: domainUrl,
    //         envName: 'ekssit',
    //         apiURL: 'https://ehapp-sit.elevancehealth.com/smarthelp/smarthelpapiv2/',
    //         oAuthRedirectURL: 'https://ehapp-sit.elevancehealth.com/app/appuidashboard/home',
    //         contextPath: '/app/appuidashboard',
    //         siteUrl: 'https://ehapp-sit.elevancehealth.com/app/appuidashboard',
    //         reactLogoutUrl: 'https://ehapp-sit.elevancehealth.com/app/appuidashboard/logout',
    //         reactUAMUrl: 'https://ehapp-sit.elevancehealth.com/app/appuiuamapp/access-management',
    //     };
    // }
    // else if (domainUrl.includes('perf')) {
    //     return {
    //         url: domainUrl,
    //         envName: 'eksperf',
    //         apiURL: 'https://ehapp-perf.elevancehealth.com/smarthelp/smarthelpapiv2/',
    //         oAuthRedirectURL: 'https://ehapp-perf.elevancehealth.com/app/appuidashboard/home',
    //         contextPath: '/app/appuidashboard',
    //         siteUrl: 'https://ehapp-perf.elevancehealth.com/app/appuidashboard',
    //         reactLogoutUrl: 'https://ehapp-perf.elevancehealth.com/app/appuidashboard/logout',
    //         reactUAMUrl: 'https://ehapp-perf.elevancehealth.com/app/appuiuamapp/access-management'
    //     };
    // }
    // else if (domainUrl.includes('ehapp.elevancehealth.com')) {
    //     return {
    //         url: domainUrl,
    //         envName: 'production',
    //         apiURL: 'https://ehapp.elevancehealth.com/smarthelp/smarthelpapiv2/',
    //         oAuthRedirectURL: 'https://ehapp.elevancehealth.com/app/appuidashboard/home',
    //         contextPath: '/app/appuidashboard',
    //         siteUrl: 'https://ehapp.elevancehealth.com/app/appuidashboard',
    //         reactLogoutUrl: 'https://ehapp.elevancehealth.com/app/appuidashboard/logout',
    //         reactUAMUrl: 'https://ehapp.elevancehealth.com/app/appuiuamapp/access-management'
    //     };
    // }
    else if (domainUrl.includes('localhost')) {
        return {
            url: domainUrl,
            envName: 'local',
            // apiURL: 'https://ehapp-uat.elevancehealth.com/smarthelp/smarthelpapiv2/',
            apiURL:'http://localhost:8082/api/v1/',
            // oAuthRedirectURL: 'http://localhost:3000/app/appuidashboard/home',
            contextPath: '/app/jsprep',
            siteUrl: 'http://localhost:3002',
            reactLogoutUrl: 'http://localhost:3002/logout',
            // reactUAMUrl: 'http://localhost:3001/app/appuiuamapp/access-management',
        };
    }
}

