export const Envurl = () => {
    //identifying environments
    let domainUrl = window.location.hostname;
    if (domainUrl.includes('jsprepreact')) {
        return {
            url: domainUrl,
            envName: 'jsprepreact',
            apiURL: 'https://jsprepbackend.onrender.com/api/v1',
            // oAuthRedirectURL: 'https://ehapp-uat.elevancehealth.com/app/appuidashboard/home',
            // contextPath: '/app/appuidashboard',
            siteUrl: 'https://jsprepreact.onrender.com',
            reactLogoutUrl: 'https://jsprepreact.onrender.com/logout',
            // reactUAMUrl: 'https://ehapp-uat.elevancehealth.com/app/appuiuamapp/access-management',
        };
    }
    else if (domainUrl.includes('localhost')) {
        return {
            url: domainUrl,
            envName: 'local',
            apiURL: 'https://jsprepbackend.onrender.com/api/v1',
            // apiURL:'http://localhost:8082/api/v1/',
            // oAuthRedirectURL: 'http://localhost:3000/app/appuidashboard/home',
            contextPath: '/app/jsprep',
            siteUrl: 'http://localhost:3000',
            reactLogoutUrl: 'http://localhost:3000/logout',
            // reactUAMUrl: 'http://localhost:3001/app/appuiuamapp/access-management',
        };
    }
}

