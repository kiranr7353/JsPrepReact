import React, { useEffect, useContext, lazy, Suspense, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Routes, Route, useLocation, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { GetCookie, SetCookie, RemoveCookie, decryptObjData } from './Utils/util-functions';
import IdleTimerComponent  from './CommonComponents/IdleTimerContainer/IdleTimerContainer';
import { Envurl } from './Envurl';
import { ReactQueryDevtools } from 'react-query/devtools';
import { RefreshToken } from './CommonComponents/RefreshToken';
import UserContextProvider from './CommonComponents/UserContextProvider';
import Skeleton from "react-loading-skeleton";
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import appStore from './Redux/Reducers/AppReducer';

const LoginHome = lazy(() => import('./Components/Login/LoginHome'));
const LogoutHome = lazy(() => import('./Components/Logout/LogoutHome'));

function App() {
  const env = useMemo(() => Envurl(), [Envurl]);
  const location = useLocation();
  let navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let persistor = persistStore(appStore);

  const [callAuthorizedApps, setCallAuthorizedApps] = useState(false);
  const whiteListUrls = ['/', '/logout', '/login', '/home'];
  const [userAuthInfo, setuserAuthInfo] = useState({});

  const isJWTTokenExpired = (token) => {
    const expiry = token ? (JSON.parse(atob(token.split('.')[1]))).exp : 0;
    return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
  }

  const cookies = useMemo(() => GetCookie('userTokenInfo'), [GetCookie('userTokenInfo')]);
  const isUserLogged = cookies && !isJWTTokenExpired(cookies.authToken) && !whiteListUrls.includes(location.pathname);

  const queryClient = new QueryClient();

  const setAuthData = () => {
    // if (location.pathname === '/logout') {
    //     navigate(`/logout${location.search || ''}`);
    // }
    // let cookies = GetCookie('userTokenInfo') ? GetCookie('userTokenInfo') : '';
    // if(searchParams.get('token')) {
    //     const paramData = searchParams.get('token') ? searchParams.get('token').replace(/xMl3Jk/g, '+') : null;
    //     cookies = paramData ? JSON.parse(decryptObjData(decodeURIComponent(paramData))) : null;
    // }
    // if(cookies && cookies.authToken && !isJWTTokenExpired(cookies.authToken)) {
    //     if (cookies.authorizedApps) delete cookies.authorizedApps;
    //     if (cookies.company) delete cookies.company;
    //     setuserAuthInfo({...cookies});
    //     SetCookie('userTokenInfo', cookies);
    //     const refeshData = RefreshToken({ userInfo: cookies });
    //     refeshData.then(res => {
    //         cookies.authToken = res.data.token;
    //         setuserAuthInfo({...cookies});
    //         SetCookie('userTokenInfo', cookies);
    //         SetCookie('tokenTimeStamp', new Date().toISOString());
    //     })
    // } else if (!whiteListUrls.includes(location.pathname) && (!cookies || (cookies && cookies.authToken && isJWTTokenExpired(cookies.authToken)))) {
    //     SetCookie('redirectUrl', window.location.href);
    //     navigate('/login');
    // }
    // if (!whiteListUrls.includes(location.pathname)) 
    window.history.pushState(null, '', `${env.siteUrl}${location.pathname}`);
  }
  useEffect(() => {
    setAuthData();
  }, []);
  return (
    <React.Fragment>
      <Provider store={appStore}>
        <QueryClientProvider client={queryClient}>
          <UserContextProvider>
            <PersistGate persistor={persistor}>
              {isUserLogged && userAuthInfo ? <IdleTimerComponent env={{ apiURL: env.apiURL, logoutUrl: env.angularLogoutUrl, reactLogoutUrl: env.reactLogoutUrl }} contextPath={env.contextPath} /> : ''}
              <div className="dashboardheaderwrp">
              </div>
              <div>
                <div className='sshui-body-wrappper'>
                  <Suspense fallback={<Skeleton />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/login" replace={true} />} />
                      <Route path="/login" element={<LoginHome />} />
                      <Route path="/logout" element={<LogoutHome />} />
                    </Routes>
                  </Suspense>
                </div>
              </div>
            </PersistGate>
          </UserContextProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
      {/* {!isUserLogged && whiteListUrls.includes(location.pathname) && <div className='sshui-footer-wrapper'><FooterComponent env={{ apiURL: env.apiURL }} /></div>} */}
    </React.Fragment>
  );
}

export default App;
