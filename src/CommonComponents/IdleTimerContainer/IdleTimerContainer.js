import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useIdleTimer  } from 'react-idle-timer';
import { Modal, Button } from 'react-bootstrap';
import IdleTimeOutStyles from './styles/IdleTimeOut.module.css';
import moment from 'moment';
import refreshToken from '../../Utils/refreshToken';
import { GetCookie, RemoveAllCookies, SetCookie } from '../../Utils/util-functions';

const IdleTimerContainer = (props) => {
  const { env, displayTimer, hoursMinSecs, contextPath } = props;
  const userInfo = useMemo(() => GetCookie('userTokenInfo'), []);
  const idleTimeRef = useRef(null);

  const getRemainingHourMinSecs = () => {
    if (GetCookie('tokenTimeStamp')) {
      const remaingSeconds = moment(new Date()).diff(new Date(GetCookie('tokenTimeStamp')), 'seconds');
      const remaingDuration = moment.utc((remaingSeconds > 840 ? 840 : 840 - remaingSeconds) * 1000).format('HH:mm:ss').split(':');
      return { hours: +remaingDuration[0], minutes: +remaingDuration[1], seconds: +remaingDuration[2] };
    } else {
      return { hours: 0, minutes: 14, seconds: 0 };
    }
  }
  const getRemainingSeconds = (hoursMinSecs) => {
    const { hours = 0, minutes = 0, seconds = 840 } = hoursMinSecs;
    const remainingSeconds = (hours * 60 * 60) + (minutes * 60) + (seconds);
    return remainingSeconds > 840 ? 840 : remainingSeconds && remainingSeconds <= 4 ? remainingSeconds : remainingSeconds - 4;
  }
  const [modalopen, setModalopen] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [timer, setTimer] = useState('10 Secs');
  const [idleSeconds, setIdleSeconds] = useState(getRemainingSeconds(getRemainingHourMinSecs()));
  const [timerOut, setTimerOut] = useState();
  const onIdle = () => {
    setModalopen(true);
    const userInfo = GetCookie('userTokenInfo');
    const sessionExpired = userInfo && isJWTTokenExpired(userInfo.authToken);
    if (sessionExpired) {
      setIsSessionExpired(true);
      setTimeout(() => { logOut(); }, 2000);
    } else {
      startTime();
    }
  }
  const isJWTTokenExpired = (token) => {
    const expiry = token ? (JSON.parse(atob(token.split('.')[1]))).exp : 0;
    return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
  }
  const stayActive = () => {
    setModalopen(false);
    clearInterval(timerOut);
    const updatedData = refreshToken(env);
    updatedData.then(res => {
      SetCookie('userTokenInfo', { ...userInfo, authToken: res.data.token });
      setIdleSeconds(getRemainingSeconds(getRemainingHourMinSecs()));
    })
  }
  const logOut = () => {
    setModalopen(false);
    clearInterval(timerOut);
    let isRedirect = GetCookie('isRedirect');
    let isRedirectFromReact = GetCookie('isRedirectFromReact');
    RemoveAllCookies();
    window.open(isRedirect ? `${env.logoutUrl}?sessionExpired=true` : isRedirectFromReact ? `${env.reactLogoutUrl}?sessionExpired=true` : `${env.reactLogoutUrl}?sessionExpired=true`, '_self');
  }
  const startTime = () => {
    let counter = 10;
    setTimerOut(setInterval(function () {
      if (counter === 0) {
        clearInterval(timerOut);
      } else {
        counter--;
        setTimer(counter + ' Secs');
        if (counter === 0) {
          logOut();
        }
      }
    }, 1000));
  }
  useEffect(() => {
    setIdleSeconds(getRemainingSeconds(getRemainingHourMinSecs()));
  }, []);
  useEffect(() => {
    setIdleSeconds(getRemainingSeconds(getRemainingHourMinSecs()));
  }, [GetCookie('tokenTimeStamp')]);

  const idleTimer = useIdleTimer({
    crossTab: true,
    ref: idleTimeRef,
    timeout: idleSeconds * 1000,
    onIdle: onIdle,
  });
  return (
    <React.Fragment>
      <Modal show={modalopen} backdrop="static" size="md">
        <Modal.Header>
          <Modal.Title>{isSessionExpired ? 'Session Expired' : 'Session Expiring'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { isSessionExpired ? <span className={IdleTimeOutStyles.timerTitle}>Your Session has been Expired, Logging you out.</span> : <><span className={IdleTimeOutStyles.timerTitle}>You are going to Logout within</span> <span className={IdleTimeOutStyles.Timer}>{timer}</span></> }
        </Modal.Body>
        <Modal.Footer>
          { isSessionExpired ? '' : <>
          <Button onClick={stayActive} variant="outline-primary">Stay Back</Button>
          <Button onClick={logOut} variant="outline-danger">Logout</Button></> }
        </Modal.Footer>
      </Modal>
      <idleTimer timeout={idleSeconds * 1000}></idleTimer>
    </React.Fragment>
  )
}
export default IdleTimerContainer;